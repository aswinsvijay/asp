import compiledRouterConfig from '../server/routerConfig/compiledRouterConfig.out';

export default function generateZapIntegration() {
  Object.entries(compiledRouterConfig).map(([operationId, config]) => {
    const key = `/api${config.path}`;

    return [
      key,
      {
        operationId,
      },
    ];
  });

  return {
    version: '1.0.0',
    platformVersion: '16.5.1',
    authentication: {
      type: 'basic',
      test: {},
    },
  };
}
