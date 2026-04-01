import { controllerGroup } from './controllerGroup';
import {
  createStoredDocument,
  getFolders,
  getStoredDocumentById,
  getStoredDocuments,
  updateStoredDocumentById,
  getDocumentCountByClass,
  getDocumentCountBySize,
} from '../db';
import {
  ServerBadRequestError,
  ServerJSONResponse,
  ServerNotFoundError,
  ServerUnauthorizedError,
  ServerStreamResponse,
} from '../objects';
import { rootFolder } from '../../src/utils';
import { ItemInfo } from '../routerConfig/compiledRouterTypes.out';
import {
  classifyDocumentFromStream,
  getDocumentStream,
  getRedactionEntitiesForDocumentStream,
  summarizeDocumentFromStream,
} from '../utils';
import { createReadStream } from 'fs';

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
      class: (document.class ?? '') || '(NO CLASS)',
    })
  );

  return new ServerJSONResponse({ data: [...mappedFolders, ...mappedDocuments] });
});

controllerGroup.add('UploadFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const userId = ctx.state.user._id;

  if (Array.isArray(ctx.request.files)) {
    throw new Error('Files should be object');
  }

  const uploadedFile = ctx.request.files?.['file']?.[0];

  if (!uploadedFile) {
    throw new Error('file is required');
  }

  const document = await createStoredDocument({
    name: uploadedFile.originalname,
    size: uploadedFile.size,
    path: uploadedFile.path,
    mimetype: uploadedFile.mimetype,
    owner: userId,
    parent: rootFolder,
  });

  void (async () => {
    const stream = createReadStream(uploadedFile.path);
    const documentClass = (await classifyDocumentFromStream(stream)).category;

    await updateStoredDocumentById(document._id, { owner: userId }, { class: documentClass });
  })();

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
  const entities = await getRedactionEntitiesForDocumentStream(stream);

  return new ServerJSONResponse({ data: entities });
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
  const documentClass = (await classifyDocumentFromStream(stream)).category;

  await updateStoredDocumentById(documentId, { owner: ctx.state.user._id }, { class: documentClass });

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

controllerGroup.add('GetFileStats', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  return new ServerJSONResponse({
    data: {
      documentClasses: await getDocumentCountByClass({ owner: ctx.state.user._id }),
      documentSizes: await getDocumentCountBySize({ owner: ctx.state.user._id }),
    },
  });
});
