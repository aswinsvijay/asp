import { IMiddleware } from 'koa-router';

export const authenticator: IMiddleware = async (_, next) => {
  await next();
};
