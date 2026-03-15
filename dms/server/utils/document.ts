import { Types } from 'mongoose';
import { getStoredDocumentById } from '../db';
import { ServerInternalError, ServerNotFoundError } from '../objects';
import { createReadStream, existsSync } from 'fs';

export const getDocumentStream = async (
  documentId: Types.ObjectId,
  args: {
    owner: Types.ObjectId;
  }
) => {
  const document = await getStoredDocumentById(documentId, {
    owner: args.owner,
  });

  if (!document) {
    throw new ServerNotFoundError('Document not found');
  }

  if (!existsSync(document.path)) {
    throw new ServerInternalError('Document does not exist on the specified path', { data: {} });
  }

  const stream = createReadStream(document.path);

  return stream;
};
