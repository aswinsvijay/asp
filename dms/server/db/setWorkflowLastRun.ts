import { Filter } from 'mongodb';
import { Config } from './models';
import { Types } from 'mongoose';

export const setWorkflowLastRun = async (workflowId: string, lastRunTime: Date, args: { owner: Types.ObjectId }) => {
  const filter = {
    owner: args.owner,
  } satisfies Filter<Config>;

  await Config.findOneAndUpdate(
    filter,
    {
      $set: { [`lastRuns.${workflowId}`]: lastRunTime },
      $setOnInsert: { owner: args.owner },
    },
    { upsert: true }
  );
};
