
// models/blast-event.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const DrillingSite =require('./drilling-site.model');
const DailyBlastOperation =require('./daily-blast-operation.model');
const coordinateService = require('../services/coordinate-conversion.service');

const BlastEvent = sequelize.define('BlastEvent', {
    blast_id: {
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
    drilling_site_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: DrillingSite ,
            key: 'drilling_site_id'
        }
    },
    blast_sequence_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    kadawala_north: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
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
    blast_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    number_of_holes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    delay_pattern_sketch_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL to blast pattern sketch with delay numbers'
    },
    status: {
        type: DataTypes.ENUM('PLANNED', 'READY', 'CHARGING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PLANNED'
    },
    rock_description: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'blast_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: async (blast) => {
            if (blast.kadawala_north && blast.kadawala_east) {
                const coords = coordinateService.kadawalaToWGS84(
                    blast.kadawala_north,
                    blast.kadawala_east
                );
                blast.wgs84_latitude = coords.latitude;
                blast.wgs84_longitude = coords.longitude;
            }
        }
    }
});

module.exports = BlastEvent;