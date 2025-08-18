#!/usr/bin/env node

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const getDatabaseConfig = () => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'todo',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  };
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
    logging: config.logging,
    pool: config.pool,
  }
);

const Category = sequelize.define(
  'Category',
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

const DEFAULT_CATEGORIES = [
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Education',
  'Finance',
  'Travel',
  'Home',
  'Entertainment',
  'Other',
];

async function createCategories() {
  try {
    console.log('🚀 Starting category seeding process...');

    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    await Category.sync();
    console.log('✅ Categories table synchronized');

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryName of DEFAULT_CATEGORIES) {
      try {
        const [category, created] = await Category.findOrCreate({
          where: { name: categoryName },
          defaults: { name: categoryName },
        });

        if (created) {
          console.log(`✅ Created category: "${categoryName}"`);
          createdCount++;
        } else {
          console.log(`⏭️  Category already exists: "${categoryName}"`);
          skippedCount++;
        }
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          console.log(`⏭️  Category already exists: "${categoryName}"`);
          skippedCount++;
        } else {
          console.error(
            `❌ Error creating category "${categoryName}":`,
            error.message
          );
          throw error;
        }
      }
    }

    console.log('\n📊 Category seeding completed successfully!');
    console.log(`   • Categories created: ${createdCount}`);
    console.log(`   • Categories skipped (already exist): ${skippedCount}`);
    console.log(
      `   • Total categories processed: ${DEFAULT_CATEGORIES.length}`
    );

    const totalCategories = await Category.count();
    console.log(`   • Total categories in database: ${totalCategories}`);
  } catch (error) {
    console.error('\n❌ Category seeding failed:', error.message);

    if (error.name === 'SequelizeConnectionError') {
      console.error(
        '💡 Please check your database connection settings in .env file'
      );
    } else if (error.name === 'SequelizeAccessDeniedError') {
      console.error('💡 Please check your database credentials');
    } else if (error.name === 'SequelizeDatabaseError') {
      console.error('💡 Please ensure the database exists and is accessible');
    }

    throw error;
  } finally {
    try {
      await sequelize.close();
      console.log('✅ Database connection closed');
    } catch (closeError) {
      console.error(
        '⚠️  Warning: Error closing database connection:',
        closeError.message
      );
    }
  }
}

async function main() {
  try {
    await createCategories();
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Script failed with error:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check database credentials in .env file');
    console.error('   3. Verify database exists and is accessible');
    console.error('   4. Check network connectivity to database host');

    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createCategories,
  DEFAULT_CATEGORIES,
  Category,
  sequelize,
};
