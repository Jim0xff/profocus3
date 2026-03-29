export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, "BAD_REQUEST", message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, "UNAUTHORIZED", message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, "NOT_FOUND", message);
  }
}

export class ConflictError extends HttpError {
  constructor(code: string, message: string) {
    super(409, code, message);
  }
}
