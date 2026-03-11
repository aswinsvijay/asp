import { Filter } from 'mongodb';
import { Folder } from './models';
import { Types } from 'mongoose';

export const getFolders = async (args: { parent: Types.ObjectId; owner: Types.ObjectId }) => {
  const filter = {
    parent: args.parent,
    owner: args.owner,
  } satisfies Filter<Folder>;

  return await Folder.find(filter).lean();
};
