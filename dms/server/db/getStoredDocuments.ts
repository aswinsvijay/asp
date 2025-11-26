import { Filter } from 'mongodb';
import { StoredDocument } from './models';
import { Types } from 'mongoose';

export const getStoredDocuments = async (parent: Types.ObjectId) => {
  const filter = {
    parent,
  } satisfies Filter<StoredDocument>;

  return await StoredDocument.find(filter).lean();
};
