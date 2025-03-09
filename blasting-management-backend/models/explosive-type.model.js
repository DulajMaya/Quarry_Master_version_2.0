const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ExplosiveType = sequelize.define('ExplosiveType', {
    ExplosiveTypeID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Will be like: EXP001, EXP002
    },
    TypeName: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    UnitOfMeasurement: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active'
    },
    CreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    UpdatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

module.exports = ExplosiveType;