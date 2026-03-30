import { Types } from 'mongoose';
import { Workflow } from './models';
import { MappedOmit } from '@/src/utils';

export const createWorkflow = async (args: {
  name: string;
  owner: Types.ObjectId;
  url: string;
  inputs: Workflow['inputs'];
}) => {
  // TODO: Add ESLint rule to enforce MappedOmit
  const insertData: MappedOmit<Workflow, '_id'> = {
    name: args.name,
    owner: args.owner,
    url: args.url,
    inputs: args.inputs,
  };

  const dataObject = new Workflow(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
