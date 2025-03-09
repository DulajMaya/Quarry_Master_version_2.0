const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const StoreInventory = sequelize.define('StoreInventory', {
    InventoryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: INV001, INV002
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
    CurrentQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    LastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    BatchNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    MinimumLevel: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    MaximumLevel: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('Active', 'LowStock', 'OutOfStock'),
        defaultValue: 'Active'
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

// Create inventory movement history model
const InventoryMovement = sequelize.define('InventoryMovement', {
    MovementID: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    InventoryID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'StoreInventories',
            key: 'InventoryID'
        }
    },
    MovementType: {
        type: DataTypes.ENUM('IN', 'OUT'),
        allowNull: false
    },
    Quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    ReferenceType: {
        type: DataTypes.ENUM('Purchase', 'Issuance', 'Return', 'Adjustment'),
        allowNull: false
    },
    ReferenceID: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    PreviousQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    NewQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    BatchNumber: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    Remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    CreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: false
});

module.exports = {
    StoreInventory,
    InventoryMovement
};