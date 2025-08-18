'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('Tasks', ['categoryId'], {
      name: 'tasks_category_id_idx',
    });

    await queryInterface.addIndex('Tasks', ['completed'], {
      name: 'tasks_completed_idx',
    });

    await queryInterface.addIndex('Tasks', ['categoryId', 'completed'], {
      name: 'tasks_category_completed_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Tasks', 'tasks_category_completed_idx');
    await queryInterface.removeIndex('Tasks', 'tasks_completed_idx');
    await queryInterface.removeIndex('Tasks', 'tasks_category_id_idx');

    await queryInterface.dropTable('Tasks');
  },
};
