import { Types } from 'mongoose';
import { TempDocument } from './models';
import { MappedOmit } from '@/src/utils';

export const createTempDocument = async (args: {
  name: string;
  size: number;
  path: string;
  mimetype: string;
  owner: Types.ObjectId;
}) => {
  // TODO: Add ESLint rule to enforce MappedOmit
  const insertData: MappedOmit<TempDocument, '_id'> = {
    name: args.name,
    size: args.size,
    path: args.path,
    mimetype: args.mimetype,
    owner: args.owner,
  };

  const dataObject = new TempDocument(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
