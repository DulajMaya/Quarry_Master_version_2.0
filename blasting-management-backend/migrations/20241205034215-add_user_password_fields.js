'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'is_first_login', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Users', 'password_change_required', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    await queryInterface.addColumn('Users', 'temp_password_expiry', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'last_password_change', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'is_first_login');
    await queryInterface.removeColumn('Users', 'password_change_required');
    await queryInterface.removeColumn('Users', 'temp_password_expiry');
    await queryInterface.removeColumn('Users', 'last_password_change');
  }
};