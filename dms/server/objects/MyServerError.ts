import { HttpStatusCode } from 'axios';

export abstract class MyServerError extends Error {
  data: NonNullable<unknown>;
  status: number;

  constructor(message: string, args: { status: number; data: NonNullable<unknown> }) {
    super(message);

    this.data = args.data;
    this.status = args.status;
  }
}

export abstract class MyServer5xxError extends MyServerError {}

export class MyServerInternalError extends MyServer5xxError {
  constructor(message: string, args: { data: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.InternalServerError,
      data: args.data,
    });
  }
}

export abstract class MyServer4xxError extends MyServerError {}

export class MyServerBadRequestError extends MyServer4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.BadRequest,
      data: args?.data ?? {},
    });
  }
}

export class MyServerUnauthorizedError extends MyServer4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.Unauthorized,
      data: args?.data ?? {},
    });
  }
}

export class MyServerForbiddenError extends MyServer4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.Forbidden,
      data: args?.data ?? {},
    });
  }
}

export class MyServerNotFoundError extends MyServer4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.NotFound,
      data: args?.data ?? {},
    });
  }
}

export class MyServerConflictError extends MyServer4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.Conflict,
      data: args?.data ?? {},
    });
  }
}
