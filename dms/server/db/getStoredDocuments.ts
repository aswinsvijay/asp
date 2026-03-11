import { Filter } from 'mongodb';
import { StoredDocument } from './models';
import { Types } from 'mongoose';

export const getStoredDocuments = async (args: { parent: Types.ObjectId; owner: Types.ObjectId }) => {
  const filter = {
    parent: args.parent,
    owner: args.owner,
  } satisfies Filter<StoredDocument>;

  return await StoredDocument.find(filter).lean();
};
