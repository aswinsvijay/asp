import fs from 'fs';
import { resolveConfig } from 'prettier';
import { JSONSchema, compile } from 'json-schema-to-typescript';
import compiledRouterConfig from '../server/routerConfig/compiledRouterConfig';

export default async function compileRouterTypes() {
  const routerConfig = compiledRouterConfig;

  
  const compiledOperations = Object.entries(routerConfig).reduce<Record<string, JSONSchema>>(
    (acc, [operationId, operationInfo]) => {
      if ('requestBody' in operationInfo) { 
        operationInfo.requestBody
      }
      const schema: JSONSchema = {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            enum: [operationInfo.path],
          },
          method: {
            type: 'string',
            enum: [operationInfo.method],
          },
          controller: {
            type: 'string',
            enum: [operationInfo.controller],
          },
          pathParams: {
            type: 'object',
            properties: operationInfo.pathParams ?? {},
            additionalProperties: false,
          },
          queryParams: {
            type: 'object',
            properties: operationInfo.queryParams ?? {},
            additionalProperties: false,
          },
          requestBody: operationInfo.requestBody,
          response: operationInfo.response,
        },
        required: ['path', 'method', 'controller', 'pathParams', 'queryParams', 'response'],
        additionalProperties: false,
      };

      return {
        ...acc,
        [operationId]: schema,
      };
    },
    {}
  );

  const config = await resolveConfig('.');

  if (!config) {
    throw new Error('No prettier config found');
  }

  fs.writeFileSync(
    './server/routerConfig/compiledRouterTypes.ts',
    await compile(
      {
        type: 'object',
        properties: compiledOperations,
        required: Object.keys(compiledOperations),
        additionalProperties: false,
      },
      'CompiledOperations',
      {
        style: config,
      }
    )
  );
}
