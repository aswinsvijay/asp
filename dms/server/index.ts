import next from 'next';
import express from 'express';
import compiledRouterConfig from './routerConfig/compiledRouterConfig';
import Ajv from 'ajv';
import { controllerGroup, initialize } from './controllers';

const expressApp = express();
const apiRouter = express.Router();
const ajv = new Ajv();

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
  apiRouter[operationInfo.method](operationInfo.path, async (req, res) => {
    const pathValidationResult = operationInfo.pathValidator(req.params);

    if (!pathValidationResult) {
      return res.status(400).send('Invalid path parameters');
    }

    const queryValidationResult = operationInfo.queryValidator(req.query);

    if (!queryValidationResult) {
      return res.status(400).send('Invalid query parameters');
    }

    const controller = controllerGroup.get(operationInfo.operationId);

    if (!controller) {
      throw new Error(`Controller for operation ${operationInfo.operationId} not found`);
    }

    const response = await controller({
      req,
      res,
      pathParams: req.params,
      queryParams: req.query,
    });

    return res.status(response.status).send(response.data);
  });
});

const isDevEnv = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev: isDevEnv, customServer: true });
const handle = nextApp.getRequestHandler();

async function main() {
  await nextApp.prepare();

  await initialize();

  expressApp.use('/api', apiRouter);

  expressApp.use((req, res) => {
    return handle(req, res);
  });

  expressApp.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

main();
