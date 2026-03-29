import { controllerGroup } from './controllerGroup';
import { createTempDocument } from '../db';
import { ServerBadRequestError, ServerJSONResponse, ServerUnauthorizedError } from '../objects';
import { getRedactionEntitiesForDocumentStream, getTempDocumentStream, summarizeDocumentFromStream } from '../utils';

controllerGroup.add('UploadTempFile', async (ctx) => {
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

  const document = await createTempDocument({
    name: uploadedFile.originalname,
    size: uploadedFile.size,
    path: uploadedFile.path,
    mimetype: uploadedFile.mimetype,
    owner: userId,
  });

  return new ServerJSONResponse({
    data: {
      id: document._id.toString(),
    },
  });
});

controllerGroup.add('GetTempFileRedactionEntities', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const stream = await getTempDocumentStream(documentId, { owner: ctx.state.user._id });
  const entities = await getRedactionEntitiesForDocumentStream(stream);

  return new ServerJSONResponse({ data: entities });
});

controllerGroup.add('SummarizeTempFile', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const documentId = ctx.pathParams.fileId;

  if (!documentId) {
    throw new ServerBadRequestError('fileId is required');
  }

  const stream = await getTempDocumentStream(documentId, { owner: ctx.state.user._id });
  const documentSummary = await summarizeDocumentFromStream(stream);

  return new ServerJSONResponse({ data: documentSummary });
});
