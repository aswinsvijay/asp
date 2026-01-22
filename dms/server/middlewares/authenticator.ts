import { IMiddleware } from 'koa-router';
import { MyServerUnauthorizedError } from '../objects';
import { User, UserSession } from '../db/models';
import { CustomState } from '../types';
import { hashPassword } from '../../src/utils/password';

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
    _id: session.user,
  });

  if (!user) {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  ctx.state.user = user;

  await next();
};

export const basicAuthenticator: IMiddleware<CustomState> = async (ctx, next) => {
  const authHeader = ctx.request.headers.authorization;

  const [scheme, base64Credentials] = authHeader?.split(' ') ?? [];

  if (scheme !== 'Basic') {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  if (!base64Credentials) {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [userId, password] = credentials.split(':');

  if (!userId || !password) {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  const user = await User.findOne({
    userId,
    hashedPassword: hashPassword(password),
  });

  if (!user) {
    throw new MyServerUnauthorizedError(errorMessage);
  }

  ctx.state.user = user;

  await next();
};
