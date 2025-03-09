// models/drilling-pattern.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  DrillingSite = require('./drilling-site.model');

const DrillingPattern = sequelize.define('DrillingPattern', {
    pattern_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    drilling_site_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: DrillingSite ,
            key: 'drilling_site_id'
        }
    },
    pattern_type: {
        type: DataTypes.ENUM('SQUARE', 'STAGGERED', 'RECTANGULAR'),
        allowNull: false
    },
    number_of_rows: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    holes_per_row: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    total_holes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Total number of holes in pattern'
    },
    spacing: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        comment: 'Spacing between holes in meters',
        validate: {
            min: 0.1
        }
    },
    burden: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        comment: 'Burden distance in meters',
        validate: {
            min: 0.1
        }
    },
    design_depth: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        comment: 'Designed hole depth in meters'
    },
    design_diameter: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
        comment: 'Designed hole diameter in millimeters'
    },
    sub_drill_depth: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Sub-drilling depth in meters'
    },
    pattern_diagram_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL to the pattern diagram image'
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'),
        defaultValue: 'DRAFT'
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
    tableName: 'drilling_patterns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: async (pattern) => {
            if (pattern.number_of_rows && pattern.holes_per_row) {
                pattern.total_holes = pattern.number_of_rows * pattern.holes_per_row;
            }
        }
    }
});

// Instance methods
DrillingPattern.prototype.validateAgainstLicense = async function(license) {
    const violations = [];
    
    if (this.spacing > license.max_spacing) {
        violations.push(`Spacing exceeds maximum allowed (${license.max_spacing}m)`);
    }
    
    if (this.burden > license.max_burden) {
        violations.push(`Burden exceeds maximum allowed (${license.max_burden}m)`);
    }
    
    if (this.design_depth > license.max_depth_of_hole) {
        violations.push(`Hole depth exceeds maximum allowed (${license.max_depth_of_hole}m)`);
    }

    if (this.total_holes > license.max_hole_per_blast) {
        violations.push(`Total holes exceed maximum allowed per blast (${license.max_hole_per_blast})`);
    }

    return {
        isValid: violations.length === 0,
        violations
    };
};

// Add method to calculate pattern area
DrillingPattern.prototype.calculatePatternArea = function() {
    const totalWidth = (this.holes_per_row - 1) * this.spacing;
    const totalLength = (this.number_of_rows - 1) * this.burden;
    return totalWidth * totalLength;
};

module.exports = DrillingPattern;