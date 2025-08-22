export type OperationInfo = {
  path: string;
  method: 'get' | 'post';
  controller: string;
  pathParams: {};
  queryParams: {};
  requestBody: {};
  response: {};
};
