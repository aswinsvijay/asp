import { MyServerResponse } from '../objects';
import Koa from 'koa';

export type MyServerControllerFn<
  T extends {
    pathParams: NonNullable<unknown>;
    queryParams: NonNullable<unknown>;
  },
  TResponse extends NonNullable<unknown>,
> = (ctx: T & { request: Koa.Request; response: Koa.Response }) => Promise<MyServerResponse<TResponse>>;
