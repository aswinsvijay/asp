import { IMiddleware } from 'koa-router';

const DEFAULT_ERROR_MESSAGE = 'Something broke!';

export const errorHandler: IMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = err instanceof Error ? err.message || DEFAULT_ERROR_MESSAGE : DEFAULT_ERROR_MESSAGE;
  }
};
