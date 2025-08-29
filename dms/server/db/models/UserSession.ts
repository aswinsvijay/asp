import { Schema, model, InferSchemaType } from 'mongoose';

const UserSessionSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true },
});

export const UserSession = model('UserSession', UserSessionSchema);

export type UserSession = InferSchemaType<typeof UserSessionSchema>;
