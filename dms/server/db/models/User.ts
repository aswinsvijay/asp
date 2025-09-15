import { Schema, model, InferSchemaType, Require_id } from 'mongoose';

const UserSchema = new Schema({
  userId: { type: String, required: true, uppercase: true },
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  createdAt: { type: Date, required: true },
})
  .index(
    {
      userId: 1,
    },
    {
      unique: true,
    }
  )
  .index(
    {
      name: 1,
    },
    {
      unique: true,
    }
  );

export const User = model('User', UserSchema);

export type User = Require_id<InferSchemaType<typeof UserSchema>>;
