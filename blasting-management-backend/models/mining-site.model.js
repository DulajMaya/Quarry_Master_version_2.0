// models/mining-site.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const License = require('./mining-license.model');
const SiteEngineer =require('./site_engineer.model')

const MiningSite = sequelize.define('MiningSite', {
    site_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    license_id: {
        type: DataTypes.INTEGER,
        references: {
            model: License,
            key: 'id'
        }
    },
    
    site_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    site_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    site_district: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    site_mining_engineer: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    site_kadawala_gps_north: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    site_kadawala_gps_east: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    site_wgs_north: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    site_wgs_east: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
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

// Hooks for coordinate conversion
const coordinateService = require('../services/coordinate-conversion.service');

MiningSite.beforeValidate(async (site) => {
    if (site.site_kadawala_gps_north && site.site_kadawala_gps_east) {
        const wgs84Coords = coordinateService.kadawalaToWGS84(
            site.site_kadawala_gps_north,
            site.site_kadawala_gps_east
        );
        site.site_wgs_north = wgs84Coords.latitude;
        site.site_wgs_east = wgs84Coords.longitude;
    }
});

module.exports = MiningSite;