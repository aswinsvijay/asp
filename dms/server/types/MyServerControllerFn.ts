import { MyServerResponse } from '../objects';
import Koa from 'koa';

export type MyServerControllerFn<
  T extends {
    pathParams: {};
    queryParams: {};
  },
  TResponse extends {},
> = (ctx: T & { req: Koa.Request; res: Koa.Response }) => Promise<MyServerResponse<TResponse>>;
