import { Schema, model, InferSchemaType } from 'mongoose';

const UserSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
});

export const User = model('User', UserSchema);

export type User = InferSchemaType<typeof UserSchema>;
