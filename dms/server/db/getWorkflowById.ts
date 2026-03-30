import { Types } from 'mongoose';
import { Workflow } from './models';

export const getWorkflowById = async (workflowId: Types.ObjectId, args: { owner: Types.ObjectId }) => {
  return await Workflow.findOne({ _id: workflowId, owner: args.owner }).lean();
};
