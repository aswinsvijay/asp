import { Schema, model, InferSchemaType, Require_id } from 'mongoose';

const TempDocumentSchema = new Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
});

export const TempDocument = model('TempDocument', TempDocumentSchema);

export type TempDocument = Require_id<InferSchemaType<typeof TempDocumentSchema>>;
