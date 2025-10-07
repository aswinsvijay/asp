import { ControllerInfo, RouterConfig } from '../schemas/routerConfig/type';

export interface OperationInfo {
  zapierConfig: ControllerInfo['zapierConfig'];
  path: string;
  method: keyof NonNullable<RouterConfig['methods']>;
  controller: string;
  pathParams: NonNullable<unknown>;
  queryParams: NonNullable<unknown>;
  requestBody: NonNullable<unknown> | null;
  response: NonNullable<unknown>;
}
