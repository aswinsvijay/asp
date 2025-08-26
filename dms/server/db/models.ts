import { Schema, model, InferSchemaType } from 'mongoose';

const StoredDocumentSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true },
  path: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, required: false },
});

export const StoredDocument = model('StoredDocument', StoredDocumentSchema);

export type StoredDocument = InferSchemaType<typeof StoredDocumentSchema>;
