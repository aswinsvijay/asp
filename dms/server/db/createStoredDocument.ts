import { Types } from 'mongoose';
import { StoredDocument } from './models';
import { MappedOmit } from '@/src/utils';

export const createStoredDocument = async (args: {
  name: string;
  path: string;
  mimetype: string;
  owner: Types.ObjectId;
}) => {
  // TODO: Add ESLint rule to enforce MappedOmit
  const insertData: MappedOmit<StoredDocument, '_id'> = {
    name: args.name,
    path: args.path,
    mimetype: args.mimetype,
    owner: args.owner,
  };

  const dataObject = new StoredDocument(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
