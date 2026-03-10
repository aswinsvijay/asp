import { Types } from 'mongoose';
import { StoredDocument } from './models';

export const updateStoredDocumentById = async (
  id: Types.ObjectId,
  payload: {
    parent?: Types.ObjectId;
  }
) => {
  const dataObject = await StoredDocument.findByIdAndUpdate(id, payload, { lean: true });

  return dataObject;
};
