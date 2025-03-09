// models/daily-blast-operation.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  MiningSite= require('./mining-site.model');

const DailyBlastOperation = sequelize.define('DailyBlastOperation', {
    daily_blast_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    miningSiteId: {  // Matching your middleware naming
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MiningSite,
            key: 'site_id'
        }
    },
    operation_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    number_of_planned_blasts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    weather_conditions: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PLANNED'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'daily_blast_operations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});


module.exports = DailyBlastOperation ;
/*
// models/daily-blast-operation.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const DailyBlastOperation = sequelize.define('DailyBlastOperation', {
    daily_blast_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    miningSiteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'MiningSites',
            key: 'site_id'
        }
    },
    operation_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isNotPastDate(value) {
                if (new Date(value) < new Date().setHours(0,0,0,0)) {
                    throw new Error('Operation date cannot be in the past');
                }
            }
        }
    },
    number_of_planned_blasts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    status: {
        type: DataTypes.ENUM(
            'PLANNED',          // Initial state
            'EXPLOSIVES_REQUESTED',  // Added state for explosive request
            'EXPLOSIVES_ISSUED',     // Added state for when explosives are issued
            'ONGOING',          // Active blasting
            'COMPLETED',        // All blasts done
            'CLOSED'           // After all returns/reconciliation
        ),
        defaultValue: 'PLANNED'
    },
    weather_conditions: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    actual_blasts_completed: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    explosives_reconciled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'daily_blast_operations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: async (operation) => {
            // Validate against license max blasts per day
            const license = await operation.getLicense();
            if (operation.number_of_planned_blasts > license.max_blasts_per_day) {
                throw new Error(`Cannot exceed ${license.max_blasts_per_day} blasts per day as per license`);
            }
        }
    }
});

// Instance methods
DailyBlastOperation.prototype.canRequestExplosives = function() {
    return this.status === 'PLANNED';
};

DailyBlastOperation.prototype.canStartBlasting = function() {
    return this.status === 'EXPLOSIVES_ISSUED';
};

DailyBlastOperation.prototype.canBeCompleted = function() {
    return this.status === 'ONGOING' && 
           this.actual_blasts_completed === this.number_of_planned_blasts;
};

DailyBlastOperation.prototype.canBeClosed = function() {
    return this.status === 'COMPLETED' && this.explosives_reconciled;
};

module.exports = DailyBlastOperation;*/