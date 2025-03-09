// models/test-blast-hole.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  TestBlasts = require('./test-blast.model');

const TestBlastHole = sequelize.define('TestBlastHole', {
    test_blast_hole_id: {
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
    water_gel_use: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    anfo_use: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    ed_delay_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    diameter: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    depth: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    bench_height: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    stemming_height: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TestBlastHole;