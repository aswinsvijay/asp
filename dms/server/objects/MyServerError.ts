import { HttpStatusCode } from 'axios';

export abstract class MyServerError extends Error {
  data: NonNullable<unknown>;
  status: number;

  constructor(data: NonNullable<unknown>, args: { status: number }) {
    super(JSON.stringify(data));

    this.data = data;
    this.status = args.status;
  }
}

export abstract class MyServer5xxError extends MyServerError {
  constructor(data: NonNullable<unknown>, args?: { status: number }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.InternalServerError,
    });
  }
}

export class MyServerInternalError extends MyServer5xxError {}

export abstract class MyServer4xxError extends MyServerError {
  constructor(data: NonNullable<unknown>, args?: { status: number }) {
    super(data, {
      status: args?.status ?? HttpStatusCode.BadRequest,
    });
  }
}

export class MyServerBadRequestError extends MyServer4xxError {
  constructor(data: NonNullable<unknown>) {
    super(data, {
      status: HttpStatusCode.BadRequest,
    });
  }
}

export class MyServerUnauthorizedError extends MyServer4xxError {
  constructor(data: NonNullable<unknown>) {
    super(data, {
      status: HttpStatusCode.Unauthorized,
    });
  }
}

export class MyServerForbiddenError extends MyServer4xxError {
  constructor(data: NonNullable<unknown>) {
    super(data, {
      status: HttpStatusCode.Forbidden,
    });
  }
}

export class MyServerConflictError extends MyServer4xxError {
  constructor(data: NonNullable<unknown>) {
    super(data, {
      status: HttpStatusCode.Conflict,
    });
  }
}
