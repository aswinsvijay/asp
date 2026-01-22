import { MappedOmit } from '@/src/utils';
import { HashedPassword } from '../../src/utils';
import { User } from './models';

export const createUser = async (args: { name: string; userId: string; hashedPassword: HashedPassword }) => {
  const insertData: MappedOmit<User, '_id'> = {
    name: args.name,
    userId: args.userId,
    hashedPassword: args.hashedPassword,
    createdAt: new Date(),
  };

  const dataObject = new User(insertData);

  await dataObject.save();

  return dataObject.toObject();
};
