require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
