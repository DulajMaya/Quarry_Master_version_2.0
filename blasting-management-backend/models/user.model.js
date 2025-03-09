
/*const { DataTypes } = require('sequelize');
const Role = require('./role.model');
const sequelize = require('../config/db.config');



const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // User status is false until approved by admin
  },
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
  },
}, {
  timestamps: false,  // Disable timestamps for this model


});

module.exports = User;*/

const { DataTypes } = require('sequelize');
const Role = require('./role.model');
const sequelize = require('../config/db.config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
  },
  // New fields
  reference_id: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  reference_type: {
    type: DataTypes.ENUM('SYSTEM_ADMIN', 'SITE_ENGINEER', 'EXPLOSIVE_CONTROLLER', 'EXPLOSIVE_DEALER'),
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },


// New fields
is_first_login: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
  allowNull: false 

},
password_change_required: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
  allowNull: false 
},
temp_password_expiry: {
  type: DataTypes.DATE,
  allowNull: true
},
last_password_change: {
  type: DataTypes.DATE,
  allowNull: true
}
});

module.exports = User;
