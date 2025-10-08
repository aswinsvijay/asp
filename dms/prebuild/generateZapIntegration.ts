import compiledRouterConfig from '../server/routerConfig/compiledRouterConfig.out';
import ZapierSchemaBuilder from 'zapier-platform-json-schema/build/ZapierSchemaBuilder';
import { Field, Create, App } from 'zapier-platform-core';
import fs from 'fs';

export function convertJsonSchemaToZapierSchema(schema: object): Field[] {
  schema = { type: 'object', ...schema };

  const inputFields = new ZapierSchemaBuilder(schema).build();

  const removeChildren = (fields: typeof inputFields): Field[] => {
    return fields.map((field): Field => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { children, ...rest } = field;

      return rest;
    });
  };

  return removeChildren(inputFields);
}

export default function generateZapIntegration() {
  const creates = Object.entries(compiledRouterConfig)
    .filter(([, config]) => {
      return config.zapierConfig.actionType === 'creates';
    })
    .map(([operationId, config]) => {
      const url = `/api${config.path}`;
      const replacedUrl = url
        .split('/')
        .map((segment) => segment.replace(/:(.*)/, '{{bundle.inputData.$1}}'))
        .join('/');

      return [
        operationId,
        {
          noun: operationId,
          operation: {
            perform: {
              url: replacedUrl,
              method: config.method.toUpperCase(),
              headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
              },
              body: '{{bundle.inputData}}',
              removeMissingValuesFrom: {
                body: false,
                params: false,
              },
            },
            inputFields: [
              ...convertJsonSchemaToZapierSchema(config.pathParams),
              ...convertJsonSchemaToZapierSchema(config.queryParams),
              ...convertJsonSchemaToZapierSchema(config.requestBody?.schema ?? {}),
            ],
          },
          display: {
            description: `Very very very very long description for ${operationId}`,
            hidden: false,
            label: operationId,
          },
          key: operationId,
        } satisfies Create,
      ] as const;
    });

  const config = {
    version: '1.0.0',
    platformVersion: '16.5.1',
    authentication: {
      type: 'basic',
      test: {
        url: 'https://{{process.env.HOST_NAME}}/api/null/children',
      },
      connectionLabel: '{{username}}',
    },
    creates: Object.fromEntries(creates),
  } satisfies App;

  fs.writeFileSync('./TestIntegration/config.json', JSON.stringify(config, null, 2));
}
