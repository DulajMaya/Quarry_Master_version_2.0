// models/blast-event-explosive.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const ExplosiveType =require('./explosive-type.model');
const BlastEvent =require('./blast-event.model');


const BlastEventExplosive = sequelize.define('BlastEventExplosive', {
    blast_explosive_id: {
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
    explosive_type_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: ExplosiveType ,
            key: 'ExplosiveTypeID'
        }
    },
    quantity_planned: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    quantity_used: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0
    },
    remarks: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'blast_event_explosives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = BlastEventExplosive;


/*
// models/blast-event-explosive.model.js

const BlastEventExplosive = sequelize.define('BlastEventExplosive', {
    blast_explosive_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    blast_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'blast_events',
            key: 'blast_id'
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
    quantity_planned: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    quantity_actual: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    status: {
        type: DataTypes.ENUM(
            'PLANNED',    // Initial planning
            'CHARGING',   // Currently being used
            'COMPLETED'   // All holes charged
        ),
        defaultValue: 'PLANNED'
    },
    is_validated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indicates if quantity has been validated against daily allocation'
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
    tableName: 'blast_event_explosives',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
        beforeValidate: async (explosive) => {
            if (explosive.quantity_actual && explosive.quantity_actual > explosive.quantity_planned) {
                throw new Error('Actual quantity cannot exceed planned quantity');
            }
        }
    }
});

// Instance methods
BlastEventExplosive.prototype.updateFromHoles = async function(transaction) {
    // Calculate total from blast holes
    const total = await this.calculateTotalFromHoles();
    
    this.quantity_actual = total;
    this.status = total > 0 ? (total === this.quantity_planned ? 'COMPLETED' : 'CHARGING') : 'PLANNED';
    
    await this.save({ transaction });
    return this;
};

BlastEventExplosive.prototype.calculateTotalFromHoles = async function() {
    const result = await sequelize.models.BlastHoleExplosive.sum('quantity', {
        where: {
            blast_id: this.blast_id,
            explosive_type_id: this.explosive_type_id
        }
    });
    return result || 0;
};

BlastEventExplosive.prototype.validateAgainstDailyAllocation = async function(dailyBlastId) {
    const dailyExplosive = await sequelize.models.DailyBlastExplosive.findOne({
        where: {
            daily_blast_id: dailyBlastId,
            explosive_type_id: this.explosive_type_id
        }
    });

    if (!dailyExplosive) {
        throw new Error('Explosive type not allocated for this daily operation');
    }

    const availableQuantity = dailyExplosive.getAvailableQuantity();
    if (this.quantity_planned > availableQuantity) {
        throw new Error(`Planned quantity exceeds available quantity (${availableQuantity} available)`);
    }

    this.is_validated = true;
    await this.save();
    return true;
};

module.exports = BlastEventExplosive;*/