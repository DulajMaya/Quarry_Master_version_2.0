const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const MiningSite =require('./mining-site.model');

const SiteEngineer = sequelize.define('SiteEngineer', {
  EngineerID: {
    type: DataTypes.STRING(20),
    primaryKey: true,
  },
  MiningSiteID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: MiningSite,
        key: 'site_id'
    }},

  Name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  NIC: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
  },
  Address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  ContactNumber: {
    type: DataTypes.STRING(15),
    allowNull: false,
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  }
}, {
  timestamps: true,
  createdAt: 'CreatedAt',
  updatedAt: 'UpdatedAt'
});

module.exports = SiteEngineer;