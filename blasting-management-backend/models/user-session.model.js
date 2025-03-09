const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const UserSession = sequelize.define('UserSession', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    socketId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    deviceInfo: {
        type: DataTypes.JSON,
        allowNull: true
    },
    lastActivity: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'user_sessions',
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['socketId']
        },
        {
            fields: ['isActive']
        }
    ]
});

// Instance methods
UserSession.prototype.updateActivity = async function() {
    this.lastActivity = new Date();
    return this.save();
};

// Static methods
UserSession.findActiveSessions = function(userId) {
    return this.findAll({
        where: {
            userId,
            isActive: true,
            expiresAt: {
                [Op.gt]: new Date()
            }
        }
    });
};

module.exports = UserSession;