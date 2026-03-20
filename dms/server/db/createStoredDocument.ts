import { Types } from 'mongoose';
import { StoredDocument } from './models';
import { MappedOmit } from '@/src/utils';

export const createStoredDocument = async (args: {
  name: string;
  size: number;
  path: string;
  mimetype: string;
  owner: Types.ObjectId;
  parent: Types.ObjectId;
}) => {
  // TODO: Add ESLint rule to enforce MappedOmit
  const insertData: MappedOmit<StoredDocument, '_id'> = {
    name: args.name,
    size: args.size,
    path: args.path,
    mimetype: args.mimetype,
    owner: args.owner,
    parent: args.parent,
  };

  const dataObject = new StoredDocument(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
