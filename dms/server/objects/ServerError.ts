import { HttpStatusCode } from 'axios';

export abstract class ServerError extends Error {
  data: NonNullable<unknown>;
  status: number;

  constructor(message: string, args: { status: number; data: NonNullable<unknown> }) {
    super(message);

    this.data = args.data;
    this.status = args.status;
  }
}

export abstract class Server5xxError extends ServerError {}

export class ServerInternalError extends Server5xxError {
  constructor(message: string, args: { data: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.InternalServerError,
      data: args.data,
    });
  }
}

export abstract class Server4xxError extends ServerError {}

export class ServerBadRequestError extends Server4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.BadRequest,
      data: args?.data ?? {},
    });
  }
}

export class ServerUnauthorizedError extends Server4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.Unauthorized,
      data: args?.data ?? {},
    });
  }
}

export class ServerForbiddenError extends Server4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.Forbidden,
      data: args?.data ?? {},
    });
  }
}

export class ServerNotFoundError extends Server4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.NotFound,
      data: args?.data ?? {},
    });
  }
}

export class ServerConflictError extends Server4xxError {
  constructor(message: string, args?: { data?: NonNullable<unknown> }) {
    super(message, {
      status: HttpStatusCode.Conflict,
      data: args?.data ?? {},
    });
  }
}
