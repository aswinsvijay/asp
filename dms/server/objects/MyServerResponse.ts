export type MyServerResponseArgs = {
  status?: number;
};

export class MyServerResponse<T> {
  data: T;
  status: number;

  constructor(data: T, args?: MyServerResponseArgs) {
    this.data = data;
    this.status = args?.status ?? 200;
  }
}

export class MyServerJSONResponse<T> extends MyServerResponse<T> {}

export type MyServerStreamResponseArgs = MyServerResponseArgs & {
  contentType: string;
};

export class MyServerStreamResponse<T> extends MyServerResponse<T> {
  contentType: string;

  constructor(data: T, args?: MyServerStreamResponseArgs) {
    super(data, args);

    this.contentType = args?.contentType ?? '';
  }
}
