// models/notification.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const Users = require('./user.model');

const Notification = sequelize.define('Notification', {
    NotificationID: {
        type: DataTypes.STRING(20),
        primaryKey: true
        // Format: NOT00001
    },
    UserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    },
    Type: {
        type: DataTypes.ENUM(
            'LOW_STOCK',
            'PERMIT_EXPIRY',
            'QUOTA_STATUS',
            'PURCHASE_STATUS',
            'ACCOUNT_STATUS',
            'SYSTEM'
        ),
        allowNull: false
    },
    Title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('UNREAD', 'READ', 'ARCHIVED'),
        defaultValue: 'UNREAD'
    },
    Priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
        defaultValue: 'MEDIUM'
    },
    ReferenceType: {
        type: DataTypes.STRING(50),
        allowNull: true
        // e.g., 'PERMIT', 'QUOTA', 'PURCHASE'
    },
    ReferenceID: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ReadAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

module.exports = Notification;