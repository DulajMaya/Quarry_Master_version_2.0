// store-threshold.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

/**
 * Main StoreThreshold Model
 */
const StoreThreshold = sequelize.define('StoreThreshold', {
    ThresholdID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: THR00001, THR00002
    },
    StoreID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveStores',
            key: 'StoreID'
        }
    },
    ExplosiveTypeID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveTypes',
            key: 'ExplosiveTypeID'
        }
    },
    MinimumQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    CriticalQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    MaximumQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    AlertPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20,
        validate: {
            min: 1,
            max: 100
        }
    },
    NotificationFrequency: {
        type: DataTypes.ENUM('Daily', 'Weekly', 'Monthly'),
        defaultValue: 'Daily'
    },
    EmailNotification: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    LastNotificationDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        defaultValue: 'Active'
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

/**
 * ThresholdHistory Model - Track threshold changes
 */
const ThresholdHistory = sequelize.define('ThresholdHistory', {
    HistoryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: THH00001, THH00002
    },
    ThresholdID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'StoreThresholds',
            key: 'ThresholdID'
        }
    },
    ChangeType: {
        type: DataTypes.ENUM('Created', 'Updated', 'Deactivated'),
        allowNull: false
    },
    PreviousMinimum: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    NewMinimum: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    PreviousCritical: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    NewCritical: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    PreviousMaximum: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    NewMaximum: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    ChangedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    Remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: false
});

/**
 * ThresholdAlert Model - Track threshold alerts
 */
const ThresholdAlert = sequelize.define('ThresholdAlert', {
    AlertID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: ALE00001, ALE00002
    },
    ThresholdID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'StoreThresholds',
            key: 'ThresholdID'
        }
    },
    AlertType: {
        type: DataTypes.ENUM('Below_Minimum', 'Below_Critical', 'Above_Maximum'),
        allowNull: false
    },
    CurrentQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    ThresholdValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    NotificationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    NotificationDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Resolved'),
        defaultValue: 'Active'
    },
    ResolvedDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

// Define model relationships
StoreThreshold.hasMany(ThresholdHistory, {
    foreignKey: 'ThresholdID',
    onDelete: 'CASCADE'
});

ThresholdHistory.belongsTo(StoreThreshold, {
    foreignKey: 'ThresholdID'
});

StoreThreshold.hasMany(ThresholdAlert, {
    foreignKey: 'ThresholdID',
    onDelete: 'CASCADE'
});

ThresholdAlert.belongsTo(StoreThreshold, {
    foreignKey: 'ThresholdID'
});

StoreThreshold.belongsTo(ExplosiveStore, {
    foreignKey: 'StoreID'
});

StoreThreshold.belongsTo(ExplosiveType, {
    foreignKey: 'ExplosiveTypeID'
});

// Instance methods for StoreThreshold
StoreThreshold.prototype.isLowStock = function(currentQuantity) {
    return currentQuantity <= this.MinimumQuantity;
};

StoreThreshold.prototype.isCriticalStock = function(currentQuantity) {
    return currentQuantity <= this.CriticalQuantity;
};

StoreThreshold.prototype.isOverStock = function(currentQuantity) {
    return currentQuantity > this.MaximumQuantity;
};

StoreThreshold.prototype.shouldSendNotification = function() {
    if (!this.EmailNotification) return false;
    if (!this.LastNotificationDate) return true;

    const now = new Date();
    const lastNotification = new Date(this.LastNotificationDate);

    switch (this.NotificationFrequency) {
        case 'Daily':
            return (now - lastNotification) >= 24 * 60 * 60 * 1000;
        case 'Weekly':
            return (now - lastNotification) >= 7 * 24 * 60 * 60 * 1000;
        case 'Monthly':
            return (now - lastNotification) >= 30 * 24 * 60 * 60 * 1000;
        default:
            return true;
    }
};

module.exports = {
    StoreThreshold,
    ThresholdHistory,
    ThresholdAlert
};
