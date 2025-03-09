const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const NotificationTemplate = sequelize.define('NotificationTemplate', {
    TemplateID: {
        type: DataTypes.STRING(20),
        primaryKey: true
        // Format: TPL00001
    },
    Name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    Type: {
        type: DataTypes.ENUM(
            'EMAIL',
            'SYSTEM',
            'BOTH'
        ),
        allowNull: false
    },
    Subject: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    Content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Variables: {
        type: DataTypes.JSON,
        allowNull: false,
        // Store template variables
        // e.g., ["userName", "storeName", "items"]
    },
    Status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE'
    },
    Category: {
        type: DataTypes.ENUM(
            'INVENTORY',
            'PERMIT',
            'QUOTA',
            'PURCHASE',
            'USER',
            'SYSTEM'
        ),
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    LastUpdatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

// Instance method to validate template variables
NotificationTemplate.prototype.validateVariables = function(data) {
    const requiredVars = this.Variables;
    const providedVars = Object.keys(data);
    
    const missingVars = requiredVars.filter(v => !providedVars.includes(v));
    if (missingVars.length > 0) {
        throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }
    
    return true;
};

module.exports = NotificationTemplate;