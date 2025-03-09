const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  TestBlasts = require('./test-blast.model');
const  MonitoringLocations = require('./monitoring-location.model');

const TestBlastMonitoring = sequelize.define('TestBlastMonitoring', {
    test_blast_monitoring_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    test_blast_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TestBlasts,
            key: 'test_blast_id'
        }
    },
    monitoring_location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MonitoringLocations,
            key: 'monitoring_location_id'
        }
    },
    ground_vibration_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    air_blast_over_pressure_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    measured_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    remarks: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TestBlastMonitoring;