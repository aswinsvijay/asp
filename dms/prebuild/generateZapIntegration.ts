import compiledRouterConfig from '../server/routerConfig/compiledRouterConfig.out';
import ZapierSchemaBuilder from 'zapier-platform-json-schema/build/ZapierSchemaBuilder';

function convertJsonSchemaToZapierSchema(schema: object) {
  return new ZapierSchemaBuilder(schema).build();
}

export default function generateZapIntegration() {
  const creates = Object.entries(compiledRouterConfig)
    .filter(([, config]) => {
      return config.zapierConfig.actionType === 'creates';
    })
    .map(([operationId, config]) => {
      const url = `/api${config.path}`;
      const urlSegments = url.split('/');
      const replacedSegments = urlSegments.map((seg) => seg.replace(/:(.*)/, '{{bundle.inputData.$1}}'));
      const replacedUrl = replacedSegments.join('/');

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
            inputFields: convertJsonSchemaToZapierSchema(config.requestBody),
          },
          display: {
            description: `Very very very very long description for ${operationId}`,
            hidden: false,
            label: operationId,
          },
          key: operationId,
        },
      ] as const;
    });

  return {
    version: '1.0.0',
    platformVersion: '16.5.1',
    authentication: {
      type: 'basic',
      test: {},
    },
    creates: Object.fromEntries(creates),
  };
}
