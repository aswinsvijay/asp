import { Filter } from 'mongodb';
import { Folder } from './models';
import { Types } from 'mongoose';

export const getFolders = async (parent: Types.ObjectId) => {
  const filter = {
    parent,
  } satisfies Filter<Folder>;

  return await Folder.find(filter).lean();
};
