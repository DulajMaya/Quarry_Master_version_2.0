// models/blast-result.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const BlastEvent =require('./blast-event.model');

const BlastResult = sequelize.define('BlastResult', {
    result_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    blast_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: BlastEvent ,
            key: 'blast_id'
        }
    },
    fragmentation_quality: {
        type: DataTypes.ENUM('EXCELLENT', 'GOOD', 'FAIR', 'POOR'),
        allowNull: true
    },
    muckpile_shape: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    throw_distance: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    back_break: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    toe_formation: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    flyrock_occurrence: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    special_observations: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    photos_url: {
        type: DataTypes.JSON,
        allowNull: true
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'blast_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BlastResult