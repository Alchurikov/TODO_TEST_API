import sequelize from '../lib/database';
import Category from './Category';
import Task from './Task';

// Flags to track initialization state
let associationsInitialized = false;
let databaseInitialized = false;

// Set up model associations
const setupAssociations = (): void => {
  if (associationsInitialized) {
    return; // Skip if already initialized
  }

  // Category has many Tasks (one-to-many relationship)
  Category.hasMany(Task, {
    foreignKey: 'categoryId',
    as: 'tasks',
    onDelete: 'CASCADE',
  });

  // Task belongs to Category (many-to-one relationship)
  Task.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });

  associationsInitialized = true;
};

// Initialize all models and associations
const initializeModels = async (): Promise<void> => {
  try {
    // Set up model associations
    setupAssociations();

    console.log('Model associations have been set up successfully.');
  } catch (error) {
    console.error('Error setting up model associations:', error);
    throw new Error(
      `Failed to initialize models: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

// Run pending migrations
const runMigrations = async (): Promise<void> => {
  try {
    // Import Umzug for migration management
    const { Umzug, SequelizeStorage } = await import('umzug');
    const path = await import('path');

    const umzug = new Umzug({
      migrations: {
        glob: path.join(process.cwd(), 'migrations/*.js'),
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
      logger: console,
    });

    // Run pending migrations
    const migrations = await umzug.up();

    if (migrations.length > 0) {
      console.log(
        `Executed ${migrations.length} migration(s):`,
        migrations.map((m) => m.name)
      );
    } else {
      console.log('No pending migrations to execute.');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw new Error(
      `Migration execution failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

// Database and model initialization for application startup
export const initializeDatabase = async (): Promise<void> => {
  if (databaseInitialized) {
    return; // Skip if already initialized
  }

  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Run migrations first
    await runMigrations();

    // Initialize models and associations
    await initializeModels();

    // Sync models with database (only in development, migrations handle production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database synchronized successfully.');
    }

    databaseInitialized = true;
    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Export models and sequelize instance
export { sequelize, Category, Task };

// Export model types for use in other parts of the application
export type {
  CategoryAttributes,
  CategoryCreationAttributes,
} from './Category';

export type { TaskAttributes, TaskCreationAttributes } from './Task';

export default {
  sequelize,
  Category,
  Task,
  initializeDatabase,
};
