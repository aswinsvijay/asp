import { MyServerResponse } from '../objects';
import Koa from 'koa';

export type MyServerControllerFn<
  T extends {
    pathParams: NonNullable<unknown>;
    queryParams: NonNullable<unknown>;
  },
  TResponse extends NonNullable<unknown>,
> = (ctx: T & { req: Koa.Request; res: Koa.Response }) => Promise<MyServerResponse<TResponse>>;
