import { Request, Response } from 'express';
import { MyServerResponse } from '../objects';

export type MyServerControllerFn<
  T extends {
    pathParams: {};
    queryParams: {};
  },
  TResponse extends {}
> = (ctx: T & { req: Request; res: Response }) => Promise<MyServerResponse<TResponse>>;
