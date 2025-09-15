export interface OperationInfo {
  path: string;
  method: 'get' | 'post' | 'patch';
  controller: string;
  pathParams: NonNullable<unknown>;
  queryParams: NonNullable<unknown>;
  requestBody: NonNullable<unknown>;
  response: NonNullable<unknown>;
}
