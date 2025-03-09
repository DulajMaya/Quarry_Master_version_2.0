// purchase.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

/**
 * Purchase Model
 */
const Purchase = sequelize.define('Purchase', {
    PurchaseID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PUR00001
    },
    QuotaID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'WeeklyQuota',
            key: 'QuotaID'
        }
    },
    DealerID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveDealers',
            key: 'DealerID'
        }
    },
    StoreID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveStores',
            key: 'StoreID'
        }
    },
    PurchaseDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM(
            'Pending',
            'Confirmed',
            'Delivered',
            'Cancelled',
            'Rejected'
        ),
        defaultValue: 'Pending'
    },
    TotalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    ReceiptNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: true
    },
    ReceiptPhotoURL: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PaymentMethod: {
        type: DataTypes.ENUM(
            'Cash',
            'BankTransfer',
            'Check'
        ),
        allowNull: false
    },
    PaymentStatus: {
        type: DataTypes.ENUM(
            'Pending',
            'Completed',
            'Failed'
        ),
        defaultValue: 'Pending'
    },
    PaymentReference: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    DealerConfirmationDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    DeliveryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    RejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Notes: {
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
 * PurchaseItems Model
 */
const PurchaseItems = sequelize.define('PurchaseItems', {
    PurchaseItemID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PUI00001
    },
    PurchaseID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'Purchases',
            key: 'PurchaseID'
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
    Quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    UnitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    TotalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    BatchNumber: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ManufactureDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    ReceivedQuantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
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
 * PurchaseHistory Model
 */
const PurchaseHistory = sequelize.define('PurchaseHistory', {
    HistoryID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PHT00001
    },
    PurchaseID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'Purchases',
            key: 'PurchaseID'
        }
    },
    ChangeType: {
        type: DataTypes.ENUM(
            'Created',
            'Updated',
            'StatusChanged',
            'Confirmed',
            'Delivered',
            'Cancelled',
            'Rejected'
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
 * PurchaseDocument Model
 */
const PurchaseDocument = sequelize.define('PurchaseDocument', {
    DocumentID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: PDC00001
    },
    PurchaseID: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'Purchases',
            key: 'PurchaseID'
        }
    },
    DocumentType: {
        type: DataTypes.ENUM(
            'Receipt',
            'Invoice',
            'DeliveryNote',
            'PaymentProof',
            'Other'
        ),
        allowNull: false
    },
    DocumentURL: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    UploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    UploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: false
});
/*
// Define relationships
Purchase.hasMany(PurchaseItems, {
    foreignKey: 'PurchaseID',
    onDelete: 'CASCADE'
});

PurchaseItems.belongsTo(Purchase, {
    foreignKey: 'PurchaseID'
});

Purchase.hasMany(PurchaseHistory, {
    foreignKey: 'PurchaseID',
    onDelete: 'CASCADE'
});

PurchaseHistory.belongsTo(Purchase, {
    foreignKey: 'PurchaseID'
});

Purchase.hasMany(PurchaseDocument, {
    foreignKey: 'PurchaseID',
    onDelete: 'CASCADE'
});

PurchaseDocument.belongsTo(Purchase, {
    foreignKey: 'PurchaseID'
});

Purchase.belongsTo(WeeklyQuota, {
    foreignKey: 'QuotaID'
});

Purchase.belongsTo(ExplosiveDealer, {
    foreignKey: 'DealerID'
});

Purchase.belongsTo(ExplosiveStore, {
    foreignKey: 'StoreID'
});

PurchaseItems.belongsTo(ExplosiveType, {
    foreignKey: 'ExplosiveTypeID'
});
*/

// Instance methods
Purchase.prototype.isEditable = function() {
    return ['Pending'].includes(this.Status);
};

Purchase.prototype.canBeCancelled = function() {
    return ['Pending', 'Confirmed'].includes(this.Status);
};

Purchase.prototype.getTotalQuantity = function() {
    return this.PurchaseItems.reduce((sum, item) => sum + Number(item.Quantity), 0);
};

Purchase.prototype.getItemSummary = function() {
    return this.PurchaseItems.map(item => ({
        type: item.ExplosiveType.TypeName,
        quantity: item.Quantity,
        totalPrice: item.TotalPrice
    }));
};

module.exports = {
    Purchase,
    PurchaseItems,
    PurchaseHistory,
    PurchaseDocument
};