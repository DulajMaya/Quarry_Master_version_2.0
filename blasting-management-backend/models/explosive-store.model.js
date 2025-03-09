const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  MiningSite= require('./mining-site.model');

const ExplosiveStore = sequelize.define('ExplosiveStore', {
    StoreID: {
        type: DataTypes.STRING(20),
        primaryKey: true,
        // Format: STR001, STR002, etc.
    },
    MiningSiteID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MiningSite,
            key: 'site_id'
        }
    },
    StoreName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    LicenseNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    LicenseExpiryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    ContactPerson: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    ContactNumber: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    Location: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Capacity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    Status: {
        type: DataTypes.ENUM('Active', 'Inactive', 'Suspended'),
        defaultValue: 'Active'
    },
    EmailNotificationStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    LastInspectionDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    NextInspectionDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    timestamps: true,
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt'
});

module.exports = ExplosiveStore;