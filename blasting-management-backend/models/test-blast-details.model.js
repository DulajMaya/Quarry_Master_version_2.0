const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const  MiningSite= require('./mining-site.model');
const  Licenses = require('./mining-license.model');


const TestBlastDetails = sequelize.define('TestBlastDetails', {
    test_blast_details_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: MiningSite,
            key: 'site_id'
        }
    },
    license_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Licenses,
            key: 'id'
        }
    },
    blast_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    number_of_blasts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    approval_comments: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = TestBlastDetails;