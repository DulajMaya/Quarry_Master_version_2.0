const { redisClient } = require('../../config/redis.config');

const socketUtils = {
    // Validate socket connection
    isValidConnection: async (socket) => {
        try {
            return socket.connected && socket.user;
        } catch (error) {
            console.error('Connection validation error:', error);
            return false;
        }
    },

    // Get active connections for a user
    getActiveConnections: async (userId) => {
        try {
            const pattern = `user:${userId}:*`;
            const connections = await redisClient.keys(pattern);
            return connections.map(conn => conn.split(':')[2]);
        } catch (error) {
            console.error('Error getting active connections:', error);
            return [];
        }
    },

    // Handle socket disconnection
    handleDisconnect: async (socket) => {
        try {
            if (socket.user) {
                const key = `user:${socket.user.id}:${socket.id}`;
                await redisClient.del(key);
            }
        } catch (error) {
            console.error('Disconnect handling error:', error);
        }
    },

    // Format socket event data
    formatEventData: (event, data) => {
        return {
            event,
            data,
            timestamp: new Date().toISOString()
        };
    },

    // Log socket events
    logSocketEvent: async (socket, event, data) => {
        try {
            console.log('Socket Event:', {
                socketId: socket.id,
                userId: socket?.user?.id,
                event,
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Event logging error:', error);
        }
    },

    // Check if user is online
    isUserOnline: async (userId) => {
        try {
            const connections = await this.getActiveConnections(userId);
            return connections.length > 0;
        } catch (error) {
            console.error('Online status check error:', error);
            return false;
        }
    }
};

module.exports = socketUtils;