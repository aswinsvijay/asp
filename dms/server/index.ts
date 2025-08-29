import next from 'next';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import { bodyParser } from '@koa/bodyparser';
import koaMulter from '@koa/multer';
import compiledRouterConfig from './routerConfig/compiledRouterConfig';
import Ajv from 'ajv';
import { controllerGroup, initialize } from './controllers';
import { errorHandler } from './middlewares';
import { MyServerJSONResponse } from './objects';

const koaApp = new Koa();
const koaRouter = new KoaRouter();
const koaApiRouter = new KoaRouter();
const ajv = new Ajv();

koaApp.use(errorHandler);
koaApp.use(bodyParser());
koaApp.use(
  koaMulter({
    dest: '/file_storage',
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
  const pathValidator = ajv.compile({
    type: 'object',
    properties: operationInfo.pathParams,
    required: [],
    additionalProperties: false,
  });

  const queryValidator = ajv.compile({
    type: 'object',
    properties: operationInfo.queryParams,
    required: [],
    additionalProperties: false,
  });

  const requestBodyValidator = ajv.compile(operationInfo.requestBody);
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
    });

    const responseValidationResult = operationInfo.responseValidator(response.data);

    if (!responseValidationResult) {
      throw new Error('Invalid response data');
    }

    ctx.status = response.status;

    if (response instanceof MyServerJSONResponse) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ctx.body = response.data;
    } else {
      throw new Error('Unhandled response type');
    }
  });
});

const isDevEnv = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: isDevEnv, customServer: true });
const handle = nextApp.getRequestHandler();

async function main() {
  await nextApp.prepare();

  await initialize();

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
