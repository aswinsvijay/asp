import { Schema, model, InferSchemaType, Require_id } from 'mongoose';

const WorkflowSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, required: true },
  url: { type: String, required: true },
  inputs: [
    {
      name: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['string', 'number', 'boolean', 'date'], // Only allow these specific types
      },
    },
  ],
});

export const Workflow = model('Workflow', WorkflowSchema);

export type Workflow = Require_id<InferSchemaType<typeof WorkflowSchema>>;
