import { Sequelize } from 'sequelize';
import pg from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  dialectModule: any;
  database: string;
  username: string;
  password: string;
  dialect: 'postgres';
  logging?: boolean | ((sql: string) => void);
  pool?: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

const getDatabaseConfig = (): DatabaseConfig => {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'todo_app',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    dialectModule: pg,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };

  return config;
};

const config = getDatabaseConfig();
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    dialectModule: config.dialectModule,
    logging: config.logging,
    pool: config.pool,
  }
);

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database synchronized successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw new Error(
      `Database connection failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('Database connection closed successfully.');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw new Error(
      `Failed to close database connection: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

export default sequelize;
