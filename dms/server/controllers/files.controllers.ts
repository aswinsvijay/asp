import { controllerGroup } from '.';
import {
  createStoredDocument,
  getFolders,
  getStoredDocumentById,
  getStoredDocuments,
  updateStoredDocumentById,
} from '../db';
import {
  ServerBadRequestError,
  ServerJSONResponse,
  ServerNotFoundError,
  ServerUnauthorizedError,
  ServerStreamResponse,
} from '../objects';
import { rootFolder, UNSAFE_CAST } from '../../src/utils';
import FormData from 'form-data';
import { EntitySpan, ItemInfo } from '../routerConfig/compiledRouterTypes.out';
import {
  classifyDocumentFromStream,
  getDocumentStream,
  redactionAxiosInstance,
  summarizeDocumentFromStream,
} from '../utils';

controllerGroup.add('GetChildren', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const parentId = ctx.pathParams.parentId ?? rootFolder;
  const folders = await getFolders({ parent: parentId, owner: ctx.state.user._id });
  const documents = await getStoredDocuments({ parent: parentId, owner: ctx.state.user._id });

  const mappedFolders = folders.map(
    (folder): ItemInfo => ({
      ...folder,
      id: folder._id.toString(),
      type: 'folder' as const,
    })
  );

  const mappedDocuments = documents.map(
    (document): ItemInfo => ({
      ...document,
      id: document._id.toString(),
      type: 'document' as const,
    })
  );

  return new ServerJSONResponse({ data: [...mappedFolders, ...mappedDocuments] });
});

controllerGroup.add('UploadFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  if (Array.isArray(ctx.request.files)) {
    throw new Error('Files should be object');
  }

  const uploadedFile = ctx.request.files?.['file']?.[0];

  if (!uploadedFile) {
    throw new Error('file is required');
  }

  const document = await createStoredDocument({
    name: uploadedFile.originalname,
    path: uploadedFile.path,
    mimetype: uploadedFile.mimetype,
    owner: ctx.state.user._id,
    parent: rootFolder,
  });

  return new ServerJSONResponse({
    data: {
      id: document._id.toString(),
    },
  });
});

controllerGroup.add('UpdateFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  if (!ctx.requestBody) {
    throw new Error('Missing requestBody');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const document = await getStoredDocumentById(documentId, { owner: ctx.state.user._id });

  if (!document) {
    throw new ServerNotFoundError('Document not found');
  }

  const updatedDocument = await updateStoredDocumentById(
    documentId,
    { owner: ctx.state.user._id },
    {
      ...(ctx.requestBody.parentId ? { parent: ctx.requestBody.parentId } : {}),
    }
  );

  if (!updatedDocument) {
    throw new Error('Update document failed');
  }

  return new ServerJSONResponse({ data: updatedDocument });
});

controllerGroup.add('DownloadFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const stream = await getDocumentStream(documentId, { owner: ctx.state.user._id });

  return new ServerStreamResponse(stream);
});

controllerGroup.add('GetRedactionEntities', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const stream = await getDocumentStream(documentId, { owner: ctx.state.user._id });

  try {
    const formData = new FormData();
    formData.append('file', stream);

    const response = await redactionAxiosInstance.post('/redaction-entities', formData, {
      headers: formData.getHeaders(),
    });

    return new ServerJSONResponse(UNSAFE_CAST<{ data: EntitySpan[] }>(response.data));
  } catch {
    throw new Error('Upstream server error');
  }
});

controllerGroup.add('ClassifyFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const stream = await getDocumentStream(documentId, { owner: ctx.state.user._id });
  const documentClass = await classifyDocumentFromStream(stream);

  return new ServerJSONResponse({ data: documentClass });
});

controllerGroup.add('SummarizeFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const stream = await getDocumentStream(documentId, { owner: ctx.state.user._id });
  const documentSummary = await summarizeDocumentFromStream(stream);

  return new ServerJSONResponse({ data: documentSummary });
});
