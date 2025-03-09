const { redisClient } = require('../../config/redis.config');

const sessionUtils = {
    async isValidSession(userId, socketId) {
        try {
            const sessionKey = `session:${userId}:${socketId}`;
            const exists = await redisClient.exists(sessionKey);
            return exists === 1;
        } catch (error) {
            console.error('Error checking session validity:', error);
            return false;
        }
    },

    async getActiveSocketIds(userId) {
        try {
            const pattern = `session:${userId}:*`;
            const keys = await redisClient.keys(pattern);
            return keys.map(key => key.split(':')[2]);
        } catch (error) {
            console.error('Error getting active socket IDs:', error);
            return [];
        }
    },

    generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    calculateExpiryTime(hours = 24) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + hours);
        return expiryDate;
    },

    async updateLastActivity(userId, socketId) {
        try {
            const sessionKey = `session:${userId}:${socketId}`;
            await redisClient.hSet(sessionKey, 'lastActivity', new Date().toISOString());
            return true;
        } catch (error) {
            console.error('Error updating last activity:', error);
            return false;
        }
    }
};

module.exports = sessionUtils;