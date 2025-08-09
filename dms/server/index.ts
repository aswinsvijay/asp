import next from 'next';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import compiledRouterConfig from './routerConfig/compiledRouterConfig';
import Ajv from 'ajv';
import { controllerGroup, initialize } from './controllers';
import { errorHandler } from './middlewares';

const koaApp = new Koa();
const koaRouter = new KoaRouter();
const koaApiRouter = new KoaRouter();
const ajv = new Ajv();

koaApiRouter.use(errorHandler);

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

  return {
    operationId,
    path: operationInfo.path,
    method: operationInfo.method,
    pathValidator,
    queryValidator,
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

    const controller = controllerGroup.get(operationInfo.operationId);

    if (!controller) {
      throw new Error(`Controller for operation ${operationInfo.operationId} not found`);
    }

    const response = await controller({
      req: ctx.request,
      res: ctx.response,
      pathParams: ctx.params,
      queryParams: ctx.query,
    });

    ctx.status = response.status;
    ctx.body = response.data;

    return;
  });
});

const isDevEnv = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: isDevEnv, customServer: true });
const handle = nextApp.getRequestHandler();

async function main() {
  await nextApp.prepare();

  await initialize();

  koaRouter.use('/api', koaApiRouter.routes());

  koaRouter.use((ctx) => {
    return handle(ctx.req, ctx.res);
  });

  koaApp.use(koaRouter.routes());

  koaApp.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

main();
