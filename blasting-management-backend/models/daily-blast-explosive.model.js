// models/daily-blast-explosive.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  DailyBlastOperation = require('./daily-blast-operation.model');
const ExplosiveType =require('./explosive-type.model');
const {ExplosiveIssuance} =require('./explosive-issuance.model');


const DailyBlastExplosive = sequelize.define('DailyBlastExplosive', {
    daily_blast_explosive_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    daily_blast_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: DailyBlastOperation ,
            key: 'daily_blast_id'
        }
    },
    explosive_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: ExplosiveType ,
            key: 'ExplosiveTypeID'
        }
    },
    explosive_issuance_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: ExplosiveIssuance ,
            key: 'issuance_id'
        }
    },
    quantity_issued: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    quantity_used: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    quantity_returned: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('ISSUED', 'PARTIALLY_USED', 'COMPLETED', 'RETURNED'),
        defaultValue: 'ISSUED'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'daily_blast_explosives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = DailyBlastExplosive;





/*

// models/daily-blast-explosive.model.js


const DailyBlastExplosive = sequelize.define('DailyBlastExplosive', {
    daily_blast_explosive_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    daily_blast_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'daily_blast_operations',
            key: 'daily_blast_id'
        }
    },
    explosive_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveTypes',
            key: 'ExplosiveTypeID'
        }
    },
    issuance_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveIssuances',
            key: 'IssuanceID'
        }
    },
    quantity_issued: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    quantity_used: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    quantity_returned: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    quantity_wasted: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    quantity_damaged: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM(
            'ISSUED',           // Initial state
            'IN_USE',           // Some quantity used
            'PARTIALLY_RETURNED', // Some quantity returned
            'FULLY_RETURNED',    // All unused quantity returned
            'COMPLETED'         // All quantities accounted for
        ),
        defaultValue: 'ISSUED'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'daily_blast_explosives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: async (explosive) => {
            // Validate total quantities
            const totalAccounted = parseFloat(explosive.quantity_used || 0) +
                                 parseFloat(explosive.quantity_returned || 0) +
                                 parseFloat(explosive.quantity_wasted || 0) +
                                 parseFloat(explosive.quantity_damaged || 0);
            
            if (totalAccounted > explosive.quantity_issued) {
                throw new Error('Total of used, returned, wasted and damaged quantities cannot exceed issued quantity');
            }
        },
        beforeSave: async (explosive) => {
            // Update status based on quantities
            explosive.status = explosive.calculateStatus();
        }
    }
});

// Instance methods
DailyBlastExplosive.prototype.calculateStatus = function() {
    const total = parseFloat(this.quantity_used || 0) +
                 parseFloat(this.quantity_returned || 0) +
                 parseFloat(this.quantity_wasted || 0) +
                 parseFloat(this.quantity_damaged || 0);

    const issued = parseFloat(this.quantity_issued);
    
    if (total === 0) return 'ISSUED';
    if (total < issued && this.quantity_returned > 0) return 'PARTIALLY_RETURNED';
    if (this.quantity_returned === issued) return 'FULLY_RETURNED';
    if (total === issued) return 'COMPLETED';
    return 'IN_USE';
};

DailyBlastExplosive.prototype.getAvailableQuantity = function() {
    return this.quantity_issued - 
           (this.quantity_used + this.quantity_returned + 
            this.quantity_wasted + this.quantity_damaged);
};

DailyBlastExplosive.prototype.canBeReturned = function() {
    return this.getAvailableQuantity() > 0;
};

module.exports = DailyBlastExplosive;*/