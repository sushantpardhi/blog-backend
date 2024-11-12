export class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class ConflictError extends CustomError {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}
