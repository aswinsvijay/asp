import { HashedPassword } from '../utils';
import { User } from './models';

export const createUser = async (args: { name: string; userId: string; hashedPassword: HashedPassword }) => {
  const insertData: User = {
    name: args.name,
    userId: args.userId,
    hashedPassword: args.hashedPassword,
    createdAt: new Date(),
  };

  const dataObject = new User(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
