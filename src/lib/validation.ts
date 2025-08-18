import { NextRequest } from 'next/server';
import { ValidationError, ParseError } from './errors';

export async function parseRequestBody(request: NextRequest): Promise<any> {
  try {
    return await request.json();
  } catch (error) {
    throw new ParseError();
  }
}

export function validateTaskId(id: string): number {
  if (!/^\s*\d+\s*$/.test(id)) {
    throw new ValidationError('Invalid task ID', [
      'Task ID must be a valid positive integer',
    ]);
  }

  const parsedId = parseInt(id.trim(), 10);

  if (isNaN(parsedId) || parsedId <= 0) {
    throw new ValidationError('Invalid task ID', [
      'Task ID must be a valid positive integer',
    ]);
  }

  return parsedId;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  categoryId: number;
}

export function validateCreateTaskInput(input: any): CreateTaskInput {
  const errors: string[] = [];

  if (
    !input.title ||
    typeof input.title !== 'string' ||
    input.title.trim().length === 0
  ) {
    errors.push('Title is required and must be a non-empty string');
  }

  if (
    !input.categoryId ||
    typeof input.categoryId !== 'number' ||
    !Number.isInteger(input.categoryId) ||
    input.categoryId <= 0
  ) {
    errors.push('Category ID is required and must be a positive integer');
  }

  if (
    input.description !== undefined &&
    typeof input.description !== 'string'
  ) {
    errors.push('Description must be a string if provided');
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return {
    title: input.title.trim(),
    description: input.description ? input.description.trim() : undefined,
    categoryId: input.categoryId,
  };
}

export interface UpdateTaskInput {
  completed: boolean;
}

export function validateUpdateTaskInput(input: any): UpdateTaskInput {
  const errors: string[] = [];

  if (typeof input.completed !== 'boolean') {
    errors.push('Completed field must be a boolean value (true or false)');
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return {
    completed: input.completed,
  };
}

export function validatePositiveInteger(value: any, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError('Validation failed', [
      `${fieldName} must be a positive integer`,
    ]);
  }
  return value;
}
