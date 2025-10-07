import compiledRouterConfig from '../server/routerConfig/compiledRouterConfig.out';

export default function generateZapIntegration() {
  const creates = Object.entries(compiledRouterConfig)
    .filter(([, config]) => {
      return config.zapierConfig.actionType === 'creates';
    })
    .map(([operationId, config]) => {
      const url = `/api${config.path}`;

      return [
        operationId,
        {
          noun: operationId,
          operation: {
            perform: {
              url,
              method: config.method.toUpperCase(),
            },
          },
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
