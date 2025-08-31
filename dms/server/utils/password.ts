import { hash } from 'crypto';

export const hashPassword = (password: string) => {
  return hash('sha256', password);
};
