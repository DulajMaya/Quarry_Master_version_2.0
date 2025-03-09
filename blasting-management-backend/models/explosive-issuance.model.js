/*const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ExplosiveIssuance = sequelize.define('ExplosiveIssuance', {
    IssuanceID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        comment: 'Format: ISU-YYYYMMDD-XXX'
    },
    StoreID: {
        type: DataTypes.STRING(20),
        references: { model: 'ExplosiveStores' }
    },

    daily_blast_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'daily_blast_operations',
            key: 'daily_blast_id'
        }
    },
    Purpose: DataTypes.TEXT,
    IssuanceDate: DataTypes.DATE,
    ReturnDate: DataTypes.DATE,
    Status: {
        type: DataTypes.ENUM('Issued', 'PartiallyReturned', 'Completed'),
        defaultValue: 'Issued'
    },
    IssuedBy: {
        type: DataTypes.INTEGER,
        references: { model: 'Users' }
    }
});

module.exports = ExplosiveIssuance;
    
    */

    // models/explosive-issuance.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ExplosiveIssuance = sequelize.define('ExplosiveIssuance', {
    issuance_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        comment: 'Format: ISU-YYYYMMDD-XXX'
    },
    daily_blast_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'daily_blast_operations',
            key: 'daily_blast_id'
        }
    },
    store_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveStores',
            key: 'StoreID'
        }
    },
    issuance_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    purpose: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Brief description of blasting purpose'
    },
    status: {
        type: DataTypes.ENUM(
            'ISSUED',         // Explosives issued from store
            'IN_USE',         // Blasting in progress
            'PENDING_RETURN', // Blasting complete, return pending
            'PARTIALLY_RETURNED',
            'COMPLETED'
        ),
        defaultValue: 'ISSUED'
    },
    completion_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When all explosives are accounted for'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'explosive_issuances',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// models/explosive-issuance-item.model.js
const ExplosiveIssuanceItem = sequelize.define('ExplosiveIssuanceItem', {
    issuance_item_id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        comment: 'Format: ISUITEM-YYYYMMDD-XXX'
    },
    issuance_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: ExplosiveIssuance,
            key: 'issuance_id'
        }
    },
    explosive_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'explosivetypes',
            key: 'ExplosiveTypeID' 
        }
    },
    batch_number: {
        type: DataTypes.STRING(50),
        allowNull: false
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
        comment: 'Auto-calculated from blast events'
    },
    quantity_returned: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    quantity_damaged: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    quantity_wasted: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    damage_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    waste_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reconciliation_status: {
        type: DataTypes.ENUM(
            'PENDING',    // Initial state
            'BALANCED',   // All quantities accounted for
            'UNBALANCED' // Discrepancy exists
        ),
        defaultValue: 'PENDING'
    },
    last_calculation_time: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Timestamp of last usage calculation'
    }
}, {
    tableName: 'explosive_issuance_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = {
    ExplosiveIssuance,
    ExplosiveIssuanceItem
};
