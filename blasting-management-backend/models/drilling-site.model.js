// models/drilling-site.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const coordinateService = require('../services/coordinate-conversion.service');
const  MiningSite= require('./mining-site.model');

const DrillingSite = sequelize.define('DrillingSite', {
    drilling_site_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    miningSiteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MiningSite,
            key: 'site_id'
        }
    },
    bench_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Bench identifier (e.g., BL-120)'
    },
    bench_elevation: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        validate: {
            min: 0
        },
        comment: 'Bench elevation in meters above MSL'
    },
    bench_height: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0
        },
        comment: 'Height of the bench in meters'
    },
    kadawala_north: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
        validate: {
            isValid(value) {
                coordinateService.validateKadawalaCoordinates(value, this.kadawala_east);
            }
        }
    },
    kadawala_east: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    wgs84_latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    wgs84_longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    rock_type: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    rock_density: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Rock density in kg/m³'
    },
    drilling_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    weather_conditions: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PLANNED', 'ACTIVE', 'COMPLETED', 'BLASTED'),
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
    tableName: 'drilling_sites',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Coordinate conversion hook
DrillingSite.beforeValidate(async (site) => {
    if (site.kadawala_north && site.kadawala_east) {
        const wgs84Coords = coordinateService.kadawalaToWGS84(
            site.kadawala_north,
            site.kadawala_east
        );
        site.wgs84_latitude = wgs84Coords.latitude;
        site.wgs84_longitude = wgs84Coords.longitude;
    }
});

// Instance methods
DrillingSite.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    return {
        ...values,
        coordinates: {
            kadawala: {
                north: values.kadawala_north,
                east: values.kadawala_east
            },
            wgs84: {
                latitude: values.wgs84_latitude,
                longitude: values.wgs84_longitude
            }
        }
    };
};

module.exports = DrillingSite;