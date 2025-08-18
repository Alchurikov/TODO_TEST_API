import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/database';

// TypeScript interface for Task attributes
export interface TaskAttributes {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for Task creation (id, timestamps, completed are auto-generated/have defaults)
export interface TaskCreationAttributes
  extends Optional<
    TaskAttributes,
    'id' | 'completed' | 'createdAt' | 'updatedAt'
  > {}

// Task model class extending Sequelize Model
export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: number;
  public title!: string;
  public description?: string;
  public completed!: boolean;
  public categoryId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Task model
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Task title cannot be empty',
        },
        len: {
          args: [1, 255],
          msg: 'Task title must be between 1 and 255 characters',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      validate: {
        isInt: {
          msg: 'Category ID must be a valid integer',
        },
        min: {
          args: [1],
          msg: 'Category ID must be a positive integer',
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['categoryId'],
      },
      {
        fields: ['completed'],
      },
    ],
  }
);

export default Task;
