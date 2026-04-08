import { Schema, model, Require_id, InferRawDocType } from 'mongoose';

const ConfigSchemaDefinition = {
  owner: { type: Schema.Types.ObjectId, required: true },
  lastRuns: {
    type: Map,
    of: Date,
    required: true,
    default: () => ({}),
  },
} as const;

const ConfigSchema = new Schema(ConfigSchemaDefinition);

export const Config = model('Config', ConfigSchema);

export type Config = Require_id<InferRawDocType<typeof ConfigSchemaDefinition>>;
