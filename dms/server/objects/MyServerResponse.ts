export class MyServerResponse<T> {
  data: T;
  status: number;

  constructor(data: T, args?: { status?: number }) {
    this.data = data;
    this.status = args?.status || 200;
  }
}
