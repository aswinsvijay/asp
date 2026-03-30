import { Schema, model, Require_id, InferRawDocType } from 'mongoose';

const WorkflowSchemaDefinition = {
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, required: true },
  url: { type: String, required: true },
  inputs: {
    type: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ['string', 'number', 'boolean', 'date'], // Only allow these specific types
        },
      },
    ],
    required: true,
  },
} as const;

const WorkflowSchema = new Schema(WorkflowSchemaDefinition);

export const Workflow = model('Workflow', WorkflowSchema);

export type Workflow = Require_id<InferRawDocType<typeof WorkflowSchemaDefinition>>;
