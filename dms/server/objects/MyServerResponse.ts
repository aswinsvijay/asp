import { HttpStatusCode } from 'axios';
import { Readable } from 'stream';
import { ContentType } from '../schemas/routerConfig/type';

export interface MyServerResponseArgs {
  status: number;
  contentType: ContentType;
}

export class MyServerResponse<T> {
  data: T;
  status: number;
  contentType: ContentType;

  constructor(data: T, args: MyServerResponseArgs) {
    this.data = data;
    this.status = args.status;
    this.contentType = args.contentType;
  }
}

export class MyServerJSONResponse<T> extends MyServerResponse<T> {
  constructor(data: T, args?: { status?: number }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.Ok,
      contentType: 'application/json',
    });
    this.data = data;
  }
}

export class MyServerStreamResponse extends MyServerResponse<Readable> {
  constructor(data: Readable, args?: { status?: number; contentType?: ContentType }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.Ok,
      contentType: args?.contentType ?? 'application/octet-stream',
    });
  }
}
