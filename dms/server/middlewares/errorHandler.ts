import { Context, Next } from 'koa';

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = err instanceof Error ? err.message : 'Something broke!';
  }
};
