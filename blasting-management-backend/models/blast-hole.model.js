// models/blast-hole.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const BlastEvent =require('./blast-event.model');
const DrillHole =require('./drill-hole.model');



const BlastHole = sequelize.define('BlastHole', {
    blast_hole_id: {
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
    drill_hole_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: DrillHole ,
            key: 'hole_id'
        }
    },
    hole_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    charge_length: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
    },
    stemming_height: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true
    },
    delay_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PLANNED', 'CHARGED', 'FIRED', 'MISFIRED'),
        defaultValue: 'PLANNED'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'blast_holes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BlastHole;