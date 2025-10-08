import next from 'next';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import { bodyParser } from '@koa/bodyparser';
import koaMulter from '@koa/multer';
import mongoose from 'mongoose';
import compiledRouterConfig from './routerConfig/compiledRouterConfig.out';
import Ajv from 'ajv';
import { mongoId, stringNull } from './keywords';
import { controllerGroup, initialize } from './controllers';
import { authenticator, errorHandler } from './middlewares';
import { MyServerBadRequestError, MyServerUnauthorizedError } from './objects';
import { User, UserSession } from './db/models';
import { hashPassword } from './utils';
import { CustomState, LoginResponse } from './types';
import { createUser } from './db';
import { MappedOmit } from '@/src/utils';
import { environment } from './environment';

const koaApp = new Koa<CustomState>();
const koaRouter = new KoaRouter<CustomState>();
const koaApiRouter = new KoaRouter<CustomState>();
const koaAuthRouter = new KoaRouter<CustomState>();
const ajv = new Ajv({
  removeAdditional: true,
  keywords: [mongoId, stringNull, 'tsType'],
});

koaApp.use(errorHandler);
koaApp.use(bodyParser());
koaApp.use(
  koaMulter({
    dest: './file_storage',
    limits: { fileSize: 5 * 1024 * 1024 },
  }).fields([
    {
      name: 'file',
      maxCount: 1,
    },
    {
      name: 'data',
      maxCount: 1,
    },
  ])
);

const compiledRoutes = Object.entries(compiledRouterConfig).map(([operationId, operationInfo]) => {
  const pathValidator = ajv.compile(operationInfo.pathParams);

  const queryValidator = ajv.compile(operationInfo.queryParams);

  const requestBodyValidator = ajv.compile(operationInfo.requestBody?.schema ?? {});
  const responseValidator = ajv.compile(operationInfo.response);

  return {
    operationId,
    path: operationInfo.path,
    method: operationInfo.method,
    pathValidator,
    queryValidator,
    requestBodyValidator,
    responseValidator,
  };
});

koaAuthRouter.post('/login', async (ctx) => {
  try {
    await createUser({
      name: 'Admin',
      userId: 'admin',
      hashedPassword: hashPassword('Admin$1234'),
    });
  } catch (error) {
    // TODO: Add ESLint rule `preserve-caught-error` to enforce passing `cause` property in the new error
    if (!(error instanceof Error)) {
      throw new Error();
    }

    if (!error.message.includes('E11000')) {
      throw new Error('Error creating admin user');
    }
  }

  const requestBody = (ctx.request.body as Record<string, unknown> | undefined) ?? {};

  const { userId, password } = requestBody;

  if (typeof userId !== 'string' || typeof password !== 'string') {
    throw new MyServerBadRequestError('userId and password and required and must be strings');
  }

  const hashedPassword = hashPassword(password);

  const user = await User.findOne({
    userId,
    hashedPassword,
  });

  if (!user) {
    throw new MyServerUnauthorizedError('Invalid userId or password');
  }

  const sessionData: MappedOmit<UserSession, '_id'> = {
    user: user._id,
    token: new mongoose.Types.ObjectId().toString(),
  };

  await new UserSession(sessionData).save();

  ctx.body = sessionData satisfies LoginResponse;
});

koaApiRouter.use(authenticator);

compiledRoutes.forEach((operationInfo) => {
  koaApiRouter[operationInfo.method](operationInfo.path, async (ctx) => {
    const pathValidationResult = operationInfo.pathValidator(ctx.params);

    if (!pathValidationResult) {
      throw new Error('Invalid path parameters');
    }

    const queryValidationResult = operationInfo.queryValidator(ctx.query);

    if (!queryValidationResult) {
      throw new Error('Invalid query parameters');
    }

    const requestBodyValidationResult = operationInfo.requestBodyValidator(ctx.request.body);

    if (!requestBodyValidationResult) {
      throw new Error('Invalid request body');
    }

    const controller = controllerGroup.get(operationInfo.operationId);

    const response = await controller({
      request: ctx.request,
      response: ctx.response,
      pathParams: ctx.params,
      queryParams: ctx.query,
      state: ctx.state,
    });

    const responseValidationResult = operationInfo.responseValidator(response.data);

    if (!responseValidationResult) {
      throw new Error('Invalid response data');
    }

    ctx.status = response.status;
    ctx.body = response.data;
  });
});

const isDevEnv = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: isDevEnv, customServer: true });
const handle = nextApp.getRequestHandler();

async function main() {
  await nextApp.prepare();

  await initialize();

  await mongoose.connect(environment.MONGODB_CONNECTION_STRING, {
    auth: { username: 'admin', password: 'password' },
  });

  await mongoose.syncIndexes();

  koaRouter.use('/auth', koaAuthRouter.routes());
  koaRouter.use('/api', koaApiRouter.routes());

  koaRouter.get('/{*any}', async (ctx) => {
    ctx.respond = false;
    ctx.response.status = 200;
    await handle(ctx.req, ctx.res);
  });

  koaApp.use(koaRouter.routes());

  koaApp.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

void main();
