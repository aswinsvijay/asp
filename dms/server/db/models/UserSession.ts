import { Schema, model, InferSchemaType } from 'mongoose';

const UserSessionSchema = new Schema({
  token: { type: String, required: true },
  userId: { type: String, required: true },
});

export const UserSession = model('UserSession', UserSessionSchema);

export type UserSession = InferSchemaType<typeof UserSessionSchema>;
