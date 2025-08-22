import { IMiddleware } from 'koa-router';

export const errorHandler: IMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = err instanceof Error ? err.message : 'Something broke!';
  }
};
