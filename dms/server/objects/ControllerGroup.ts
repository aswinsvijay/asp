import { RemoveIndexSignature } from '@/src/utils';
import { MyServerControllerFn, OperationInfo } from '../types';

export class ControllerGroup<TParameterTypes extends Record<string, OperationInfo>> {
  public routerConfig: Record<string, OperationInfo>;
  public controllerMap: Map<
    string,
    MyServerControllerFn<{ pathParams: NonNullable<unknown>; queryParams: NonNullable<unknown> }, NonNullable<unknown>>
  >;

  constructor(routerConfig: Record<string, OperationInfo>) {
    this.routerConfig = routerConfig;
    this.controllerMap = new Map();
  }

  add<TOperation extends keyof RemoveIndexSignature<TParameterTypes>>(
    operation: string & TOperation,
    controller: MyServerControllerFn<
      {
        pathParams: TParameterTypes[TOperation]['pathParams'];
        queryParams: TParameterTypes[TOperation]['queryParams'];
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
