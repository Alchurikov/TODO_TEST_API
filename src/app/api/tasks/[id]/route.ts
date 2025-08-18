import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '../../../../lib/errorHandler';
import {
  parseRequestBody,
  validateTaskId,
  validateUpdateTaskInput,
} from '../../../../lib/validation';
import { updateTask, deleteTask } from '../../../../lib/taskService';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT /api/tasks/[id]
 * Update task completion status
 */
export const PUT = withErrorHandler(
  async (request: NextRequest, { params }: RouteParams) => {
    const resolvedParams = await params;
    const taskId = validateTaskId(resolvedParams.id);

    const requestBody = await parseRequestBody(request);
    const validatedInput = validateUpdateTaskInput(requestBody);

    const updatedTask = await updateTask(taskId, validatedInput);

    return NextResponse.json(
      {
        task: {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          completed: updatedTask.completed,
          categoryId: updatedTask.categoryId,
          createdAt: updatedTask.createdAt,
          updatedAt: updatedTask.updatedAt,
        },
      },
      { status: 200 }
    );
  }
);

/**
 * DELETE /api/tasks/[id]
 * Delete a specific task
 */
export const DELETE = withErrorHandler(
  async (request: NextRequest, { params }: RouteParams) => {
    const resolvedParams = await params;
    const taskId = validateTaskId(resolvedParams.id);

    await deleteTask(taskId);

    return new NextResponse(null, { status: 204 });
  }
);
