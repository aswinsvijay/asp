import { Types } from 'mongoose';
import { getStoredDocumentById } from '../db';
import { MyServerInternalError, MyServerNotFoundError } from '../objects';
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
    throw new MyServerNotFoundError('Document not found');
  }

  if (!existsSync(document.path)) {
    throw new MyServerInternalError('Document does not exist on the specified path', { data: {} });
  }

  const stream = createReadStream(document.path);

  return stream;
};
