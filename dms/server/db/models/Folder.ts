import { Schema, model, InferSchemaType, Require_id } from 'mongoose';

const FolderSchema = new Schema({
  name: { type: String, required: true },
  parent: { type: Schema.Types.ObjectId, required: true },
});

export const Folder = model('Folder', FolderSchema);

export type Folder = Require_id<InferSchemaType<typeof FolderSchema>>;
