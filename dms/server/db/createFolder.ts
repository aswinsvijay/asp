import { Types } from 'mongoose';
import { Folder } from './models';
import { MappedOmit } from '@/src/utils';

export const createFolder = async (args: { name: string; parent: Types.ObjectId }) => {
  // TODO: Add ESLint rule to enforce MappedOmit
  const insertData: MappedOmit<Folder, '_id'> = {
    name: args.name,
    parent: args.parent,
  };

  const dataObject = new Folder(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
