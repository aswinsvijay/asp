import { rootFolder } from '../../src/utils';
import { controllerGroup } from '.';
import { createFolder } from '../db';
import { ServerBadRequestError, ServerJSONResponse, ServerNotFoundError, ServerUnauthorizedError } from '../objects';
import { getStoredDocumentsRecursive } from '../db/getStoredDocumentsRecursive';

controllerGroup.add('CreateFolder', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  if (!ctx.requestBody) {
    throw new Error('Missing requestBody');
  }

  const folder = await createFolder({
    name: ctx.requestBody.name,
    owner: ctx.state.user._id,
    parent: ctx.requestBody.parentId ?? rootFolder,
  });

  return new ServerJSONResponse({
    data: {
      id: folder._id.toString(),
    },
  });
});

controllerGroup.add('SummarizeFolder', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
  }

  const { folderId } = ctx.pathParams;

  if (!folderId) {
    throw new ServerBadRequestError('folderId is required');
  }

  const recursiveDocuments = await getStoredDocumentsRecursive({
    parent: folderId,
    owner: ctx.state.user._id,
  });

  if (!recursiveDocuments.length) {
    throw new ServerNotFoundError('No documents to summarize');
  }

  return new ServerJSONResponse({
    data: '',
  });
});
