import { ControllerInfo, RouterConfig } from '../schemas/routerConfig/type';

export interface OperationInfo {
  actionType: ControllerInfo['actionType'];
  path: string;
  method: keyof NonNullable<RouterConfig['methods']>;
  controller: string;
  pathParams: NonNullable<unknown>;
  queryParams: NonNullable<unknown>;
  requestBody: NonNullable<unknown>;
  response: NonNullable<unknown>;
}
