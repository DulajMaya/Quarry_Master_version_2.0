// explosive-permit.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const License = require('./mining-license.model');
const  MiningSite= require('./mining-site.model');
const ExplosiveType =require('./explosive-type.model');

/**
 * Main ExplosivePermit Model
 */
const ExplosivePermit = sequelize.define('ExplosivePermit', {
    PermitID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PER00001
    },
    MiningSiteID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MiningSite,
            key: 'site_id'
        }
    },
    LicenseID: {
        type: DataTypes.INTEGER,
        references: {
            model: License,
            key: 'id'
        }
    },
    ControllerID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveControllers',
            key: 'ControllerID'
        }
    },
    PermitNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    IssueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Purpose: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('Pending', 'Active', 'Expired', 'Cancelled', 'Suspended'),
        defaultValue: 'Pending'
    },
    PermitPhotoURL: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ValidityPeriod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 180, // 6 months in days
        validate: {
            min: 1,
            max: 365
        }
    },
    LastUsageDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    Remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ApprovalDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ApprovedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    RejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    CreatedBy: {
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
 * PermitAllowedExplosive Model
 * Tracks allowed quantities for each explosive type
 */
const PermitAllowedExplosive = sequelize.define('PermitAllowedExplosive', {
    AllowedID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PAE00001
    },
    PermitID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosivePermits',
            key: 'PermitID'
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
    AllowedQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    RemainingQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    Unit: {
        type: DataTypes.STRING(20),
        allowNull: false
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
 * PermitHistory Model
 * Tracks all changes to permit
 */
const PermitHistory = sequelize.define('PermitHistory', {
    HistoryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PHT00001
    },
    PermitID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosivePermits',
            key: 'PermitID'
        }
    },
    ChangeType: {
        type: DataTypes.ENUM(
            'Created', 
            'Updated', 
            'StatusChanged', 
            'Approved', 
            'Rejected', 
            'Expired', 
            'Suspended'
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
    ChangedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    ChangeDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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
 * PermitUsage Model
 * Tracks permit usage through quotas
 */
const PermitUsage = sequelize.define('PermitUsage', {
    UsageID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PUS00001
    },
    PermitID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosivePermits',
            key: 'PermitID'
        }
    },
    QuotaID: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    ExplosiveTypeID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveTypes',
            key: 'ExplosiveTypeID'
        }
    },
    UsedQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    PreviousRemaining: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    NewRemaining: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    UsageDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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

// Define model relationships
ExplosivePermit.hasMany(PermitAllowedExplosive, {
    foreignKey: 'PermitID',
    onDelete: 'CASCADE'
});

PermitAllowedExplosive.belongsTo(ExplosivePermit, {
    foreignKey: 'PermitID'
});

ExplosivePermit.hasMany(PermitHistory, {
    foreignKey: 'PermitID',
    onDelete: 'CASCADE'
});

PermitHistory.belongsTo(ExplosivePermit, {
    foreignKey: 'PermitID'
});

ExplosivePermit.hasMany(PermitUsage, {
    foreignKey: 'PermitID',
    onDelete: 'CASCADE'
});

PermitUsage.belongsTo(ExplosivePermit, {
    foreignKey: 'PermitID'
});

// Add to explosive type relationships
PermitAllowedExplosive.belongsTo(ExplosiveType, {
    foreignKey: 'ExplosiveTypeID'
});

PermitUsage.belongsTo(ExplosiveType, {
    foreignKey: 'ExplosiveTypeID'
});

// Instance methods
ExplosivePermit.prototype.isActive = function() {
    return this.Status === 'Active' && new Date() < this.ExpiryDate;
};

ExplosivePermit.prototype.canBeUsed = function() {
    return this.isActive() && this.Status !== 'Suspended';
};

ExplosivePermit.prototype.getRemainingDays = function() {
    const today = new Date();
    const expiry = new Date(this.ExpiryDate);
    const diffTime = Math.abs(expiry - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Export models
module.exports = {
    ExplosivePermit,
    PermitAllowedExplosive,
    PermitHistory,
    PermitUsage
};