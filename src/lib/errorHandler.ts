import { NextResponse } from 'next/server';
import { APIError, DatabaseError, ValidationError } from './errors';

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  if (error && typeof error === 'object' && 'name' in error) {
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = (error as any).errors?.map(
        (err: any) => err.message
      ) || ['Validation failed'];

      const validationError = new ValidationError(
        'Validation failed',
        validationErrors
      );
      return NextResponse.json(validationError.toJSON(), {
        status: validationError.statusCode,
      });
    }

    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const validationError = new ValidationError(
        'Foreign key constraint failed',
        ['Invalid reference to related resource']
      );
      return NextResponse.json(validationError.toJSON(), {
        status: validationError.statusCode,
      });
    }

    if (
      error.name === 'SequelizeConnectionError' ||
      error.name === 'SequelizeDatabaseError'
    ) {
      const dbError = new DatabaseError('Database connection failed', [
        'Unable to connect to the database',
      ]);
      return NextResponse.json(dbError.toJSON(), {
        status: dbError.statusCode,
      });
    }
  }

  const dbError = new DatabaseError('Internal server error', [
    error instanceof Error ? error.message : 'Unknown error occurred',
  ]);
  return NextResponse.json(dbError.toJSON(), { status: dbError.statusCode });
}

export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleAPIError(error);
    }
  };
}
