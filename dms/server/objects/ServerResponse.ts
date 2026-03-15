import { HttpStatusCode } from 'axios';
import { Readable } from 'stream';
import { ContentType } from '../schemas/routerConfig/type';

export interface ServerResponseArgs {
  status: number;
  contentType: ContentType;
}

export class ServerResponse<T> {
  data: T;
  status: number;
  contentType: ContentType;

  constructor(data: T, args: ServerResponseArgs) {
    this.data = data;
    this.status = args.status;
    this.contentType = args.contentType;
  }
}

export class ServerJSONResponse<T> extends ServerResponse<T> {
  constructor(data: T, args?: { status?: number }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.Ok,
      contentType: 'application/json',
    });
    this.data = data;
  }
}

export class ServerStreamResponse extends ServerResponse<Readable> {
  constructor(data: Readable, args?: { status?: number; contentType?: ContentType }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.Ok,
      contentType: args?.contentType ?? 'application/octet-stream',
    });
  }
}
