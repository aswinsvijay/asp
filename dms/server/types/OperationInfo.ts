import { RouterConfig } from '../schemas/routerConfig/type';

export interface OperationInfo {
  path: string;
  method: keyof NonNullable<RouterConfig['methods']>;
  pathParams: NonNullable<unknown>;
  queryParams: NonNullable<unknown>;
  requestBody: NonNullable<unknown> | null;
  response: NonNullable<unknown>;
}
