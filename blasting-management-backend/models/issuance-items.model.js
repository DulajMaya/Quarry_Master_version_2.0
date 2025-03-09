const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');


const IssuanceItems = sequelize.define('IssuanceItems', {
    IssuanceItemID: {
        type: DataTypes.STRING(20),
        primaryKey: true
    },
    IssuanceID: {
        type: DataTypes.STRING(20),
        references: { model: 'ExplosiveIssuances' }
    },
    ExplosiveTypeID: {
        type: DataTypes.STRING(20),
        references: { model: 'ExplosiveTypes' }
    },
    IssuedQuantity: DataTypes.DECIMAL(10,2),
    UsedQuantity: DataTypes.DECIMAL(10,2),
    ReturnedQuantity: DataTypes.DECIMAL(10,2)
});
module.exports = IssuanceItems;
