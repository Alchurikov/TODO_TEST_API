/**
 * Custom error classes for the TODO API
 * Provides structured error handling with proper HTTP status codes
 */

export abstract class APIError extends Error {
  abstract statusCode: number;
  abstract details: string[];

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class ValidationError extends APIError {
  statusCode = 400;
  details: string[];

  constructor(message: string = 'Validation failed', details: string[] = []) {
    super(message);
    this.details = details;
  }
}

export class NotFoundError extends APIError {
  statusCode = 404;
  details: string[];

  constructor(message: string = 'Resource not found', details: string[] = []) {
    super(message);
    this.details = details;
  }
}

export class DatabaseError extends APIError {
  statusCode = 500;
  details: string[];

  constructor(
    message: string = 'Database error occurred',
    details: string[] = []
  ) {
    super(message);
    this.details = details;
  }
}

export class ParseError extends ValidationError {
  constructor(message: string = 'Invalid JSON in request body') {
    super(message, ['Request body must be valid JSON']);
  }
}
