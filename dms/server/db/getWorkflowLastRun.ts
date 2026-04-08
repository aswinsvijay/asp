import { Filter } from 'mongodb';
import { Config } from './models';
import { Types } from 'mongoose';

export const getWorkflowLastRun = async (workflowId: string, args: { owner: Types.ObjectId }) => {
  const filter = {
    owner: args.owner,
  } satisfies Filter<Config>;

  const config = await Config.findOne(filter);
  return config?.lastRuns.get(workflowId) ?? null;
};
