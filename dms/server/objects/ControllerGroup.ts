import { ServerControllerFn, OperationInfo } from '../types';

export class ControllerGroup<TParameterTypes extends Record<string, OperationInfo>> {
  public routerConfig: Record<string, OperationInfo>;
  public controllerMap: Map<
    string,
    ServerControllerFn<Pick<OperationInfo, 'pathParams' | 'queryParams' | 'requestBody'>, NonNullable<unknown>>
  >;

  constructor(routerConfig: Record<keyof TParameterTypes, OperationInfo>) {
    this.routerConfig = routerConfig;
    this.controllerMap = new Map();
  }

  add<TOperation extends keyof TParameterTypes & string>(
    operation: TOperation,
    controller: ServerControllerFn<
      Pick<TParameterTypes[TOperation], 'pathParams' | 'queryParams' | 'requestBody'>,
      TParameterTypes[TOperation]['response']
    >
  ) {
    if (this.controllerMap.has(operation)) {
      throw new Error(`Duplicate operation ${operation}`);
    }

    this.controllerMap.set(operation, controller);
  }

  get(operation: string) {
    const controller = this.controllerMap.get(operation);

    if (!controller) {
      throw new Error(`Operation ${operation} not found`);
    }

    return controller;
  }
}
