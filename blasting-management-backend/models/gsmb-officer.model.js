const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const GSMBOfficer = sequelize.define('GSMBOfficer', {
    gsmb_officer_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telephone_number: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    email_address: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = GSMBOfficer ;