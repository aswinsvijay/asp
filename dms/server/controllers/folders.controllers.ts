import { rootFolder } from '../../src/utils';
import { controllerGroup } from './controllerGroup';
import { createFolder } from '../db';
import {
  ServerBadRequestError,
  ServerInternalError,
  ServerJSONResponse,
  ServerNotFoundError,
  ServerUnauthorizedError,
} from '../objects';
import { getStoredDocumentsRecursive } from '../db/getStoredDocumentsRecursive';
import { createReadStream, existsSync } from 'fs';
import { Readable } from 'stream';
import { summarizeDocumentFromStream } from '../utils';

controllerGroup.add('CreateFolder', async (ctx) => {
  if (!ctx.state.user) {
    throw new ServerUnauthorizedError('Un-authorized');
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

  const documentStreams = recursiveDocuments.map((document) => {
    if (!existsSync(document.path)) {
      throw new ServerInternalError('Document does not exist on the specified path', { data: {} });
    }
    return createReadStream(document.path);
  });

  async function* concatStreams() {
    for (const s of documentStreams) {
      for await (const chunk of s) {
        yield chunk;
      }

      yield '\n\n';
    }
  }

  const summary = await summarizeDocumentFromStream(Readable.from(concatStreams()));

  return new ServerJSONResponse({ data: summary });
});
