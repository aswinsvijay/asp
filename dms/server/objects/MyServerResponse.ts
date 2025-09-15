import { HttpStatusCode } from 'axios';
import { Readable } from 'stream';
import { ContentType } from './ContentType';

export interface MyServerResponseArgs {
  status: number;
  contentType: string;
}

export class MyServerResponse<T> {
  data: T;
  status: number;
  contentType: string;

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
      contentType: ContentType.APPLICATION_JSON,
    });
    this.data = data;
  }
}

export class MyServerStreamResponse extends MyServerResponse<Readable> {
  constructor(data: Readable, args?: { status?: number; contentType?: string }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.Ok,
      contentType: args?.contentType ?? ContentType.APPLICATION_OCTET_STREAM,
    });
  }
}
