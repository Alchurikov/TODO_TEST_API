import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '../../../lib/errorHandler';
import {
  parseRequestBody,
  validateCreateTaskInput,
} from '../../../lib/validation';
import { getAllTasks, createTask } from '../../../lib/taskService';

/**
 * GET /api/tasks
 * Retrieve all tasks with their associated category information
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const tasks = await getAllTasks();

  return NextResponse.json(
    {
      tasks: tasks,
    },
    { status: 200 }
  );
});

/**
 * POST /api/tasks
 * Create a new task with validation
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const requestBody = await parseRequestBody(request);
  const validatedInput = validateCreateTaskInput(requestBody);

  const newTask = await createTask(validatedInput);

  return NextResponse.json(
    {
      task: newTask,
    },
    { status: 201 }
  );
});
