/**
 * Base custom error class
 */
export class AppError extends Error {
  public statusCode: number;
  public details: any;

  constructor(message: string, statusCode: number = 500, details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Thrown when bad inputs are provided
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

/**
 * Thrown when an item is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Thrown when the EXPA GraphQL API responds with errors
 */
export class ExpaApiError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 502, details); // 502 Bad Gateway indicates upstream error
  }
}
