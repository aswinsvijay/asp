import { hash } from 'crypto';

export type HashedPassword = string & { readonly _: unique symbol };

export const hashPassword = (password: string): HashedPassword => {
  return hash('sha256', password) as HashedPassword;
};
