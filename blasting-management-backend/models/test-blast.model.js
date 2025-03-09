const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  TestBlastDetails = require('./test-blast-details.model');
const  GSMBOfficers = require('./gsmb-officer.model');


const TestBlast = sequelize.define('TestBlast', {
    test_blast_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    test_blast_details_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TestBlastDetails,
            key: 'test_blast_details_id'
        }
    },
    gsmb_officer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: GSMBOfficers,
            key: 'gsmb_officer_id'
        }
    },
    kadawala_gps_north: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    kadawala_gps_east: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    wgs_north: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    wgs_east: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    time_fired: {
        type: DataTypes.TIME,
        allowNull: false
    },
    number_of_holes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    number_of_rows: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    holes_sketch_url: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TestBlast;