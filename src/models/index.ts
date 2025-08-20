import sequelize from '../lib/database';
import Category from './Category';
import Task from './Task';


let associationsInitialized = false;
let databaseInitialized = false;


const setupAssociations = (): void => {
  if (associationsInitialized) {
    return; 
  }


  Category.hasMany(Task, {
    foreignKey: 'categoryId',
    as: 'tasks',
    onDelete: 'CASCADE',
  });


  Task.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
  });

  associationsInitialized = true;
};


const initializeModels = async (): Promise<void> => {
  try {

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


const runMigrations = async (): Promise<void> => {
  try {

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


export const initializeDatabase = async (): Promise<void> => {
  if (databaseInitialized) {
    return;
  }

  try {

    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');


    await runMigrations();


    await initializeModels();


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


export { sequelize, Category, Task };


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
