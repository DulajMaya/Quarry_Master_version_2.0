const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const MiningSites = require('./mining-site.model');

const MonitoringLocation = sequelize.define('MonitoringLocation', {
    monitoring_location_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MiningSites,
            key: 'site_id'
        }
    },
    kadawala_gps_north: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    kadawala_gps_east: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    wgs_north: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    wgs_east: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    owners_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    telephone_number: {
        type: DataTypes.STRING(20)
    },
    email_address: {
        type: DataTypes.STRING(100),
        validate: {
            isEmail: true
        }
    },
    location_description: {
        type: DataTypes.TEXT
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = MonitoringLocation;