import { Types } from 'mongoose';
import { StoredDocument } from './models';

export const getStoredDocumentById = async (documentId: Types.ObjectId) => {
  return await StoredDocument.findById(documentId).lean();
};
