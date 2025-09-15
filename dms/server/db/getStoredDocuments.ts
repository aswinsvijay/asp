import { Filter } from 'mongodb';
import { StoredDocument } from './models';
import { Types } from 'mongoose';

export const getStoredDocuments = async (parent: Types.ObjectId | null) => {
  const filter = {
    ...(parent ? { parent } : { parent: { $exists: false } }),
  } satisfies Filter<StoredDocument>;

  return await StoredDocument.find(filter).lean();
};
