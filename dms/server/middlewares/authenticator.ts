import { IMiddleware } from 'koa-router';
import { MyServerUnauthorizedError } from '../objects';
import { User, UserSession } from '../db/models';
import { CustomState } from '../types';

const errorMessage = 'Un-authorized';

export const authenticator: IMiddleware<CustomState> = async (ctx, next) => {
  const token = ctx.request.headers['x-auth-token'];

  if (typeof token !== 'string') {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  const session = await UserSession.findOne({
    token,
  });

  if (!session) {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  const user = await User.findOne({
    userId: session.userId,
  });

  if (!user) {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  ctx.state.user = user;

  await next();
};
