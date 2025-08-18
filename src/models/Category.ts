import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../lib/database';

export interface CategoryAttributes {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreationAttributes
  extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the Category model
Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Category name cannot be empty',
        },
        len: {
          args: [1, 255],
          msg: 'Category name must be between 1 and 255 characters',
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
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
    ],
  }
);

export default Category;
