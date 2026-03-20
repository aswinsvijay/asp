import { Schema, model, InferSchemaType, Require_id } from 'mongoose';

const StoredDocumentSchema = new Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  owner: { type: Schema.Types.ObjectId, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, required: true },
  class: { type: String },
});

export const StoredDocument = model('StoredDocument', StoredDocumentSchema);

export type StoredDocument = Require_id<InferSchemaType<typeof StoredDocumentSchema>>;
