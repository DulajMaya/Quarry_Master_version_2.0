'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user_sessions', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            socketId: {
                type: Sequelize.STRING,
                allowNull: false
            },
            token: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            deviceInfo: {
                type: Sequelize.JSON,
                allowNull: true
            },
            lastActivity: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Add indexes
        await queryInterface.addIndex('user_sessions', ['userId']);
        await queryInterface.addIndex('user_sessions', ['socketId']);
        await queryInterface.addIndex('user_sessions', ['isActive']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('user_sessions');
    }
};