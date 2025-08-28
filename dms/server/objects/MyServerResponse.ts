import { Readable } from 'stream';

export interface MyServerResponseArgs {
  status?: number;
}

export class MyServerResponse<T> {
  data: T;
  status: number;

  constructor(data: T, args?: MyServerResponseArgs) {
    this.data = data;
    this.status = args?.status ?? 200;
  }
}

export class MyServerJSONResponse<T> extends MyServerResponse<T> {}

export interface MyServerStreamResponseArgs extends MyServerResponseArgs {
  contentType: string;
}

export class MyServerStreamResponse extends MyServerResponse<Readable> {
  contentType: string;

  constructor(data: Readable, args?: MyServerStreamResponseArgs) {
    super(data, args);

    this.contentType = args?.contentType ?? '';
  }
}
