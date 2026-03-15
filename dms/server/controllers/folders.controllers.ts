import { rootFolder } from '../../src/utils';
import { controllerGroup } from '.';
import { createFolder } from '../db';
import {
  MyServerBadRequestError,
  MyServerJSONResponse,
  MyServerNotFoundError,
  MyServerUnauthorizedError,
} from '../objects';
import { getStoredDocumentsRecursive } from '../db/getStoredDocumentsRecursive';

controllerGroup.add('CreateFolder', async (ctx) => {
  if (!ctx.state.user) {
    throw new MyServerUnauthorizedError('Un-authorized');
  }

  if (!ctx.requestBody) {
    throw new Error('Missing requestBody');
  }

  const folder = await createFolder({
    name: ctx.requestBody.name,
    owner: ctx.state.user._id,
    parent: ctx.requestBody.parentId ?? rootFolder,
  });

  return new MyServerJSONResponse({
    data: {
      id: folder._id.toString(),
    },
  });
});

controllerGroup.add('SummarizeFolder', async (ctx) => {
  if (!ctx.state.user) {
    throw new MyServerUnauthorizedError('Un-authorized');
  }

  const { folderId } = ctx.pathParams;

  if (!folderId) {
    throw new MyServerBadRequestError('folderId is required');
  }

  const recursiveDocuments = await getStoredDocumentsRecursive({
    parent: folderId,
    owner: ctx.state.user._id,
  });

  if (!recursiveDocuments.length) {
    throw new MyServerNotFoundError('No documents to summarize');
  }

  return new MyServerJSONResponse({
    data: '',
  });
});
