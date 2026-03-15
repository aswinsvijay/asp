import { ServerResponse } from '../objects';
import Koa from 'koa';
import { CustomState } from './CustomState';

export type ServerControllerFn<
  T extends {
    pathParams: NonNullable<unknown>;
    queryParams: NonNullable<unknown>;
  },
  TResponse extends NonNullable<unknown>,
> = (
  ctx: T & { request: Koa.Request; response: Koa.Response; state: CustomState }
) => Promise<ServerResponse<TResponse>>;
