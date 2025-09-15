import { ControllerGroup } from '../objects';
import compiledRouterConfig from '../routerConfig/compiledRouterConfig.out';
import { CompiledOperations } from '../routerConfig/compiledRouterTypes.out';
import { OperationInfo } from '../types';

export const controllerGroup = new ControllerGroup<CompiledOperations & Record<string, OperationInfo>>(
  compiledRouterConfig
);

export async function initialize() {
  const uniqueFiles = [
    ...new Set(Object.values(compiledRouterConfig).map((operationInfo) => operationInfo.controller)),
  ];

  await Promise.all(
    uniqueFiles.map(async (file) => {
      await import(`./${file}`);
    })
  );
}
