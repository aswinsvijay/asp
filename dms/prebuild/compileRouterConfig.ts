import fs from 'fs';
import { format, resolveConfig } from 'prettier';
import { PostMethodConfig, RouterConfig, PathMethods } from '../server/schemas/routerConfig/type';
import routerConfig from '../server/routerConfig/routerConfig';
import { OperationInfo } from '@/server/types';

function* compileRouterGenerator(
  path: string,
  routerConfig: RouterConfig,
  ctx: Pick<PostMethodConfig, 'pathParams' | 'queryParams'> = {}
): Generator<
  Record<
    string,
    {
      path: string;
      method: keyof PathMethods;
      controller: string;
      response: NonNullable<PathMethods[keyof PathMethods]>['response'];
    } & typeof ctx
  >,
  void,
  unknown
> {
  for (const innerPath in routerConfig.paths) {
    const joinedPath = `${path}${innerPath === '/' ? '' : innerPath}`;
    const innerConfig = routerConfig.paths[innerPath];

    if (!innerConfig) {
      continue;
    }

    yield* compileRouterGenerator(joinedPath, innerConfig, ctx);
  }

  const compiledOperations: Record<string, OperationInfo> = {};

  for (const m in routerConfig.methods) {
    const method = m as keyof PathMethods;
    const operationInfo = routerConfig.methods[method];

    if (!operationInfo) {
      continue;
    }

    compiledOperations[operationInfo.operationId] = {
      path,
      method,
      actionType: operationInfo.actionType,
      controller: operationInfo.controller,
      pathParams: {
        type: 'object',
        properties: { ...ctx.pathParams?.properties, ...operationInfo.pathParams?.properties },
        additionalProperties: false,
      },
      queryParams: {
        type: 'object',
        properties: { ...ctx.queryParams?.properties, ...operationInfo.queryParams?.properties },
        additionalProperties: false,
      },
      requestBody: operationInfo.requestBody ?? {},
      response: operationInfo.response,
    };
  }

  yield compiledOperations;
}

export default async function compileRouter() {
  const compiledOperations = [...compileRouterGenerator('', routerConfig)].reduce((acc, cur) => {
    return { ...acc, ...cur };
  });

  const config = await resolveConfig(__dirname);

  if (!config) {
    throw new Error('No prettier config found');
  }

  const templateString = fs.readFileSync('./server/templates/compiledRouterConfig', 'utf8');
  const replacedString = await format(
    templateString.replace('`{{compiledRouterConfig}}`', JSON.stringify(compiledOperations, null, 2)),
    { ...config, parser: 'typescript' }
  );

  fs.writeFileSync('./server/routerConfig/compiledRouterConfig.out.ts', replacedString);
}
