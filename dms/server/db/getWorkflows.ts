import { Filter } from 'mongodb';
import { Workflow } from './models';
import { Types } from 'mongoose';

export const getWorkflows = async (args: { owner: Types.ObjectId }) => {
  const filter = {
    owner: args.owner,
  } satisfies Filter<Workflow>;

  return await Workflow.find(filter).lean();
};
