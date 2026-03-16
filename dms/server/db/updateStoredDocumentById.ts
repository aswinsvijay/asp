import { Types } from 'mongoose';
import { StoredDocument } from './models';

export const updateStoredDocumentById = async (
  id: Types.ObjectId,
  args: {
    owner: Types.ObjectId | { $exists: true };
  },
  payload: {
    parent?: Types.ObjectId;
    class?: string;
  }
) => {
  const dataObject = await StoredDocument.findOneAndUpdate({ _id: id, owner: args.owner }, payload, { lean: true });

  return dataObject;
};
