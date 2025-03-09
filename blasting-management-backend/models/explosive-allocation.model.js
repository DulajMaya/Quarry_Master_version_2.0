// models/explosive-allocation.model.js
/*const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const ExplosiveAllocation = sequelize.define('ExplosiveAllocation', {
    allocation_id: {
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
    store_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveStores',
            key: 'StoreID'
        }
    },
    status: {
        type: DataTypes.ENUM(
            'REQUESTED',
            'APPROVED',
            'ISSUED',
            'PARTIALLY_RETURNED',
            'COMPLETED'
        ),
        defaultValue: 'REQUESTED'
    },
    issue_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    remarks: DataTypes.TEXT,
    created_by: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    }
});

// Add allocation items relation
const ExplosiveAllocationItem = sequelize.define('ExplosiveAllocationItem', {
    item_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    allocation_id: {
        type: DataTypes.UUID,
        references: {
            model: ExplosiveAllocation,
            key: 'allocation_id'
        }
    },
    explosive_type_id: {
        type: DataTypes.STRING(20),
        references: {
            model: ExplosiveType,
            key: 'ExplosiveTypeID' 
        }
    },
    quantity_requested: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    quantity_issued: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0
    },
    quantity_used: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0
    },
    quantity_returned: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0
    },
    quantity_wasted: {
        type: DataTypes.DECIMAL(10,2),
        defaultValue: 0
    }
  });

  module.exports = {
    ExplosiveAllocation,
    ExplosiveAllocationItem
};*/