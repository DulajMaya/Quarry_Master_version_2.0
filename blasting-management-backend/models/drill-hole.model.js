// models/drill-hole.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  DrillingPattern = require('./drilling-pattern.model');
const  DrillingSite = require('./drilling-site.model');

const DrillHole = sequelize.define('DrillHole', {
    hole_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    pattern_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: DrillingPattern,
            key: 'pattern_id'
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
    hole_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Unique hole identifier within pattern (e.g., R1H1 for Row 1 Hole 1)'
    },
    row_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    hole_in_row: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    designed_depth: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        comment: 'Designed depth in meters'
    },
    actual_depth: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Actual drilled depth in meters'
    },
    designed_diameter: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        comment: 'Designed diameter in millimeters'
    },
    actual_diameter: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Actual drilled diameter in millimeters'
    },
    angle: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        defaultValue: 90.00,
        comment: 'Hole angle in degrees from horizontal'
    },
    sub_drill_depth: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Sub-drilling depth in meters'
    },
    water_condition: {
        type: DataTypes.ENUM('DRY', 'DAMP', 'WET', 'HIGHLY_WET'),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM(
            'PLANNED',    // Initial state
            'MARKED',     // Location marked
            'DRILLED',    // Drilling completed
            'CHARGED',    // Explosives loaded
            'BLASTED',    // Hole has been blasted
            'FAILED'      // Drilling failed or abandoned
        ),
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
    tableName: 'drill_holes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Instance methods
DrillHole.prototype.calculateDeviations = function() {
    return {
        depth_deviation: this.actual_depth 
            ? ((this.actual_depth - this.designed_depth) / this.designed_depth * 100).toFixed(2)
            : null,
        diameter_deviation: this.actual_diameter 
            ? ((this.actual_diameter - this.designed_diameter) / this.designed_diameter * 100).toFixed(2)
            : null
    };
};

module.exports = DrillHole;