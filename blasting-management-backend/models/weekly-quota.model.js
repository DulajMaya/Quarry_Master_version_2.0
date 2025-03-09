// weekly-quota.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

/**
 * WeeklyQuota Model
 */
const WeeklyQuota = sequelize.define('WeeklyQuota', {
    QuotaID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: QTA00001
    },
    PermitID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosivePermits',
            key: 'PermitID'
        }
    },
    RequestDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    PlannedUsageDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    ApprovalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Status: {
        type: DataTypes.ENUM(
            'Pending',
            'Approved',
            'Rejected',
            'Expired',
            'Used',
            'Cancelled'
        ),
        defaultValue: 'Pending'
    },
    QuotaSealPhotoURL: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Purpose: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    BlastingLocation: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    BlastingTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    SafetyMeasures: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ApprovedBy: {
        type: DataTypes.STRING(20),
        allowNull: true,
        references: {
            model: 'ExplosiveControllers',
            key: 'ControllerID'
        }
    },
    RejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ValidityPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7, // 7 days validity
        validate: {
            min: 1,
            max: 14 // Maximum 2 weeks validity
        }
    },
    ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    CreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    LastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

/**
 * QuotaItems Model
 */
const QuotaItems = sequelize.define('QuotaItems', {
    QuotaItemID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: QTI00001
    },
    QuotaID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'WeeklyQuota',
            key: 'QuotaID'
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
    CalculatedQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    PurchaseStatus: {
        type: DataTypes.ENUM('Available', 'Used'),
        defaultValue: 'Available'
    },
    Unit: {
        type: DataTypes.STRING(20),
        allowNull: false
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

/**
 * QuotaHistory Model
 */
const QuotaHistory = sequelize.define('QuotaHistory', {
    HistoryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: QTH00001
    },
    QuotaID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'WeeklyQuota',
            key: 'QuotaID'
        }
    },
    ChangeType: {
        type: DataTypes.ENUM(
            'Created',
            'Updated',
            'StatusChanged',
            'Approved',
            'Rejected',
            'Used',
            'Expired'
        ),
        allowNull: false
    },
    PreviousStatus: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    NewStatus: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Changes: {
        type: DataTypes.JSON,
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
 * QuotaUsage Model
 */
const QuotaUsage = sequelize.define('QuotaUsage', {
    UsageID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: QTU00001
    },
    QuotaID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'WeeklyQuota',
            key: 'QuotaID'
        }
    },
    UsageDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    BlastingReport: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SafetyChecklist: {
        type: DataTypes.JSON,
        allowNull: false
    },
    WeatherConditions: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    SupervisorName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('Completed', 'Partial', 'Cancelled'),
        defaultValue: 'Completed'
    },
    RecordedBy: {
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
    updatedAt: false
});
/*
// Define relationships
WeeklyQuota.hasMany(QuotaItems, {
    foreignKey: 'QuotaID',
    onDelete: 'CASCADE'
});

QuotaItems.belongsTo(WeeklyQuota, {
    foreignKey: 'QuotaID'
});

WeeklyQuota.hasMany(QuotaHistory, {
    foreignKey: 'QuotaID',
    onDelete: 'CASCADE'
});

QuotaHistory.belongsTo(WeeklyQuota, {
    foreignKey: 'QuotaID'
});

WeeklyQuota.hasMany(QuotaUsage, {
    foreignKey: 'QuotaID',
    onDelete: 'CASCADE'
});

QuotaUsage.belongsTo(WeeklyQuota, {
    foreignKey: 'QuotaID'
});

WeeklyQuota.belongsTo(ExplosivePermit, {
    foreignKey: 'PermitID'
});

QuotaItems.belongsTo(ExplosiveType, {
    foreignKey: 'ExplosiveTypeID'
});
*/
// Instance methods
/*WeeklyQuota.prototype.isValid = function() {
    return this.Status === 'Approved' && 
           new Date() <= new Date(this.ExpiryDate);
};*/

/*WeeklyQuota.prototype.canBeUsed = function() {
    return this.isValid() && this.Status !== 'Used';
};

WeeklyQuota.prototype.getRemainingDays = function() {
    const today = new Date();
    const expiry = new Date(this.ExpiryDate);
    const diffTime = Math.abs(expiry - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

WeeklyQuota.prototype.getTotalQuantities = function() {
    return this.QuotaItems.reduce((acc, item) => {
        acc[item.ExplosiveTypeID] = {
            requested: item.RequestedQuantity,
            approved: item.ApprovedQuantity,
            used: item.UsedQuantity
        };
        return acc;
    }, {});
};*/

module.exports = {
    WeeklyQuota,
    QuotaItems,
    QuotaHistory,
    QuotaUsage
};