import { IMiddleware } from 'koa-router';
import { MyServerError } from '../objects';

export const errorHandler: IMiddleware = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('------------------------------------------');
    console.error(err);
    console.error('------------------------------------------');

    const errorInfo = {
      status: 500,
      message: 'Unhandled error',
      data: {},
    };

    if (err instanceof MyServerError) {
      errorInfo.status = err.status;
      errorInfo.message = err.message || 'Internal server error';
      errorInfo.data = err.data;
    }

    ctx.status = errorInfo.status;
    ctx.body = {
      message: errorInfo.message,
      data: errorInfo.data,
    };
  }
};
