import { Types } from 'mongoose';
import { TempDocument } from './models';

export const getTempDocumentById = async (documentId: Types.ObjectId, args: { owner: Types.ObjectId }) => {
  return await TempDocument.findOne({ _id: documentId, owner: args.owner }).lean();
};
