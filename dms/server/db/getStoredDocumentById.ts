import { Types } from 'mongoose';
import { StoredDocument } from './models';

export const getStoredDocumentById = async (documentId: Types.ObjectId, args: { owner: Types.ObjectId }) => {
  return await StoredDocument.findOne({ _id: documentId, owner: args.owner }).lean();
};
