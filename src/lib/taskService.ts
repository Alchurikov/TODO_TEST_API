import { NotFoundError, ValidationError, DatabaseError } from './errors';
import {
  CreateTaskInput,
  UpdateTaskInput,
  validatePositiveInteger,
} from './validation';

async function initializeDB() {
  try {
    const { initializeDatabase } = await import('../models');
    await initializeDatabase();
  } catch (error) {
    throw new DatabaseError('Failed to initialize database connection', [
      error instanceof Error ? error.message : 'Unknown database error',
    ]);
  }
}

export async function getAllTasks() {
  await initializeDB();

  try {
    const { Task, Category } = await import('../models');

    const tasks = await Task.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return tasks;
  } catch (error) {
    throw new DatabaseError('Failed to retrieve tasks', [
      error instanceof Error ? error.message : 'Unknown database error',
    ]);
  }
}

export async function createTask(input: CreateTaskInput) {
  await initializeDB();

  try {
    const { Task, Category } = await import('../models');

    const category = await Category.findByPk(input.categoryId);
    if (!category) {
      throw new ValidationError('Category validation failed', [
        `Category with ID ${input.categoryId} does not exist`,
      ]);
    }

    const newTask = await Task.create({
      title: input.title,
      description: input.description,
      categoryId: input.categoryId,
      completed: false,
    });

    return newTask;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }

    throw new DatabaseError('Failed to create task', [
      error instanceof Error ? error.message : 'Unknown database error',
    ]);
  }
}

export async function findTaskById(taskId: number) {
  await initializeDB();

  try {
    const { Task } = await import('../models');

    const task = await Task.findByPk(taskId);

    if (!task) {
      throw new NotFoundError('Task not found', [
        `Task with ID ${taskId} does not exist`,
      ]);
    }

    return task;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new DatabaseError('Failed to find task', [
      error instanceof Error ? error.message : 'Unknown database error',
    ]);
  }
}

export async function updateTask(taskId: number, input: UpdateTaskInput) {
  const task = await findTaskById(taskId);

  try {
    await task.update(input);
    return task;
  } catch (error) {
    throw new DatabaseError('Failed to update task', [
      error instanceof Error ? error.message : 'Unknown database error',
    ]);
  }
}

export async function deleteTask(taskId: number) {
  const task = await findTaskById(taskId);

  try {
    await task.destroy();
  } catch (error) {
    throw new DatabaseError('Failed to delete task', [
      error instanceof Error ? error.message : 'Unknown database error',
    ]);
  }
}
