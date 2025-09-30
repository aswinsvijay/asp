import compiledRouterConfig from '../server/routerConfig/compiledRouterConfig.out';

export default function generatePAConnector() {
  Object.entries(compiledRouterConfig).map(([operationId, config]) => {
    const key = `/api${config.path}`;

    return [
      key,
      {
        operationId,
      },
    ];
  });
}
