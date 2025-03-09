
// models/blast-hole-explosive.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const ExplosiveType =require('./explosive-type.model');
const BlastHole =require('./blast-hole.model');


const BlastHoleExplosive = sequelize.define('BlastHoleExplosive', {
    blast_hole_explosive_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    blast_hole_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: BlastHole ,
            key: 'blast_hole_id'
        }
    },
    explosive_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: ExplosiveType ,
            key: 'ExplosiveTypeID'
        }
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'blast_hole_explosives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BlastHoleExplosive;

/*

// models/blast-hole-explosive.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const BlastHoleExplosive = sequelize.define('BlastHoleExplosive', {
    blast_hole_explosive_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    blast_hole_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'blast_holes',
            key: 'blast_hole_id'
        }
    },
    explosive_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: 'ExplosiveTypes',
            key: 'ExplosiveTypeID'
        }
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    charging_sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Order in charging sequence'
    },
    status: {
        type: DataTypes.ENUM(
            'PLANNED',   // Initial state
            'CHARGING',  // Currently being charged
            'CHARGED',   // Charging completed
            'FIRED',     // After blast
            'FAILED'     // Failed to charge or misfire
        ),
        defaultValue: 'PLANNED'
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'blast_hole_explosives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        afterSave: async (explosive, options) => {
            // Update parent blast event explosive quantities
            const blastHole = await explosive.getBlastHole();
            const blastEvent = await blastHole.getBlastEvent();
            const blastEventExplosive = await sequelize.models.BlastEventExplosive.findOne({
                where: {
                    blast_id: blastEvent.blast_id,
                    explosive_type_id: explosive.explosive_type_id
                }
            });

            if (blastEventExplosive) {
                await blastEventExplosive.updateFromHoles(options.transaction);
            }
        }
    }
});

// Instance methods
BlastHoleExplosive.prototype.validateQuantity = async function(blastHole) {
    // Get hole details for validation
    const hole = blastHole || await this.getBlastHole({
        include: ['drillHole']
    });

    // Basic validations based on hole parameters
    if (this.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
    }

    // Calculate maximum safe charge based on hole parameters
    const maxCharge = this.calculateMaxCharge(hole);
    if (this.quantity > maxCharge) {
        throw new Error(`Quantity exceeds maximum safe charge of ${maxCharge}kg for this hole`);
    }

    return true;
};

BlastHoleExplosive.prototype.calculateMaxCharge = function(hole) {
    // This would implement your specific formula for maximum charge
    // based on hole parameters like depth, diameter, etc.
    const chargingLength = hole.depth - hole.stemming_height;
    // Example calculation - replace with actual formula
    return chargingLength * 0.8; // 80% of charging length as a safe maximum
};

BlastHoleExplosive.prototype.recordFailure = async function(reason, transaction) {
    this.status = 'FAILED';
    this.remarks = reason;
    await this.save({ transaction });
    
    // Update related hole status
    const blastHole = await this.getBlastHole();
    await blastHole.update({ status: 'FAILED' }, { transaction });
};

module.exports = BlastHoleExplosive;*/