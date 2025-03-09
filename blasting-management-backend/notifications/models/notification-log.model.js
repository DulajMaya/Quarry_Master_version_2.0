const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db.config');

const NotificationLog = sequelize.define('NotificationLog', {
    LogID: {
        type: DataTypes.STRING(20),
        primaryKey: true
        // Format: LOG00001
    },
    NotificationID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'Notifications',
            key: 'NotificationID'
        }
    },
    TemplateID: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
            model: 'NotificationTemplates',
            key: 'TemplateID'
        }
    },
    DeliveryType: {
        type: DataTypes.ENUM('EMAIL', 'SYSTEM', 'BOTH'),
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM(
            'PENDING',
            'SENT',
            'FAILED',
            'DELIVERED',
            'READ'
        ),
        defaultValue: 'PENDING'
    },
    RecipientEmail: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    RecipientUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    SendAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    LastAttemptAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    DeliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ReadAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ErrorDetails: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    MessageID: {
        type: DataTypes.STRING(100),
        allowNull: true
        // For email tracking
    },
    MetaData: {
        type: DataTypes.JSON,
        allowNull: true
        // Additional tracking data
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

/*
// Add indexes for better query performance
NotificationLog.addIndex('idx_notification_status', ['Status']);
NotificationLog.addIndex('idx_notification_delivery', ['DeliveryType', 'Status']);
NotificationLog.addIndex('idx_notification_recipient', ['RecipientUserID', 'Status']);*/



module.exports = NotificationLog ;