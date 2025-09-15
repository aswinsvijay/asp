import { Schema, model, InferSchemaType, Require_id } from 'mongoose';

const UserSessionSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export const UserSession = model('UserSession', UserSessionSchema);

export type UserSession = Require_id<InferSchemaType<typeof UserSessionSchema>>;
