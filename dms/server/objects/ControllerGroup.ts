import { RemoveIndexSignature } from '@/src/utils';
import { ServerControllerFn, OperationInfo } from '../types';

export class ControllerGroup<TParameterTypes extends Record<string, OperationInfo>> {
  public routerConfig: Record<string, OperationInfo>;
  public controllerMap: Map<
    string,
    ServerControllerFn<
      { pathParams: NonNullable<unknown>; queryParams: NonNullable<unknown>; requestBody: NonNullable<unknown> },
      NonNullable<unknown>
    >
  >;

  constructor(routerConfig: Record<string, OperationInfo>) {
    this.routerConfig = routerConfig;
    this.controllerMap = new Map();
  }

  add<TOperation extends keyof RemoveIndexSignature<TParameterTypes>>(
    operation: string & TOperation,
    controller: ServerControllerFn<
      {
        pathParams: TParameterTypes[TOperation]['pathParams'];
        queryParams: TParameterTypes[TOperation]['queryParams'];
        requestBody: TParameterTypes[TOperation]['requestBody'];
      },
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
