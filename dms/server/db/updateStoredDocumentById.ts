import { Types } from 'mongoose';
import { StoredDocument } from './models';

export const updateStoredDocumentById = async (
  id: Types.ObjectId,
  args: { owner: Types.ObjectId },
  payload: {
    parent?: Types.ObjectId;
  }
) => {
  const dataObject = await StoredDocument.findOneAndUpdate({ _id: id, owner: args.owner }, payload, { lean: true });

  return dataObject;
};
