const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ExplosiveController = sequelize.define('ExplosiveController', {
    ControllerID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    Name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    NIC: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
    },
    Address: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    District: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    ContactNumber: {
        type: DataTypes.STRING(15),
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active',
    },
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

module.exports = ExplosiveController;