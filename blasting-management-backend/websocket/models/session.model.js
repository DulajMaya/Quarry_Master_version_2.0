/*const { redisClient } = require('../../config/redis.config');

class SessionModel {
    constructor(userId, socketId) {
        this.userId = userId;
        this.socketId = socketId;
        this.key = `session:${userId}:${socketId}`;
    }

    // Save session data to Redis
    /*async save(data = {}) {
        try {
            const sessionData = {
                userId: this.userId,
                socketId: this.socketId,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                ...data
            };

            await redisClient.hSet(this.key, sessionData);
            // Set expiry for 24 hours
            await redisClient.expire(this.key, 24 * 60 * 60);
            
            return sessionData;
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    }


        // Save session data to Redis
    async save(data = {}) {
        try {
            const sessionData = {
                userId: this.userId,
                socketId: this.socketId,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                ...data
            };

            // Convert sessionData object to array of field-value pairs
            const fieldValues = [];
            for (const [key, value] of Object.entries(sessionData)) {
                fieldValues.push(key, JSON.stringify(value));
            }

            // Use Redis HSET with proper arguments
            await redisClient.hSet(this.key, fieldValues);
            // Set expiry for 24 hours
            await redisClient.expire(this.key, 24 * 60 * 60);
            
            return sessionData;
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    }

    // Get session data from Redis
    async get() {
        try {
            const session = await redisClient.hGetAll(this.key);
            return Object.keys(session).length > 0 ? session : null;
        } catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }

    // Update session data
    async update(data) {
        try {
            const session = await this.get();
            if (!session) return null;

            const updatedData = {
                ...session,
                ...data,
                lastActivity: new Date().toISOString()
            };

            await redisClient.hSet(this.key, updatedData);
            return updatedData;
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }

    // Delete session
    async delete() {
        try {
            await redisClient.del(this.key);
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }

    // Static methods for session management
    static async getUserSessions(userId) {
        try {
            const keys = await redisClient.keys(`session:${userId}:*`);
            const sessions = [];
            
            for (const key of keys) {
                const session = await redisClient.hGetAll(key);
                if (Object.keys(session).length > 0) {
                    sessions.push(session);
                }
            }
            
            return sessions;
        } catch (error) {
            console.error('Error getting user sessions:', error);
            throw error;
        }
    }

    static async deleteUserSessions(userId) {
        try {
            const keys = await redisClient.keys(`session:${userId}:*`);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            return true;
        } catch (error) {
            console.error('Error deleting user sessions:', error);
            throw error;
        }
    }
}

module.exports = SessionModel;*/

const { redisClient } = require('../../config/redis.config');

class SessionModel {
    constructor(userId, socketId) {
        this.userId = userId;
        this.socketId = socketId;
        this.key = `session:${userId}:${socketId}`;
    }

    // Save session data to Redis
    async save(data = {}) {
        try {
            const sessionData = {
                userId: this.userId,
                socketId: this.socketId,
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                ...data
            };

            // Convert data to a single string
            const serializedData = JSON.stringify(sessionData);
            
            // Use basic SET instead of HSET
            await redisClient.set(this.key, serializedData);
            
            // Set expiry for 24 hours
            await redisClient.expire(this.key, 24 * 60 * 60);
            
            return sessionData;
        } catch (error) {
            console.error('Error saving session:', error);
            throw error;
        }
    }

    // Get session data
    async get() {
        try {
            const data = await redisClient.get(this.key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting session:', error);
            throw error;
        }
    }

    // Update session data
    async update(data) {
        try {
            const existingData = await this.get();
            if (!existingData) return null;

            const updatedData = {
                ...existingData,
                ...data,
                lastActivity: new Date().toISOString()
            };

            await redisClient.set(this.key, JSON.stringify(updatedData));
            return updatedData;
        } catch (error) {
            console.error('Error updating session:', error);
            throw error;
        }
    }

    // Delete session
    async delete() {
        try {
            await redisClient.del(this.key);
            return true;
        } catch (error) {
            console.error('Error deleting session:', error);
            throw error;
        }
    }

    // Static methods
    static async getUserSessions(userId) {
        try {
            const pattern = `session:${userId}:*`;
            const keys = await redisClient.keys(pattern);
            const sessions = [];
            
            for (const key of keys) {
                const data = await redisClient.get(key);
                if (data) {
                    sessions.push(JSON.parse(data));
                }
            }
            
            return sessions;
        } catch (error) {
            console.error('Error getting user sessions:', error);
            throw error;
        }
    }

    static async deleteUserSessions(userId) {
        try {
            const pattern = `session:${userId}:*`;
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
            return true;
        } catch (error) {
            console.error('Error deleting user sessions:', error);
            throw error;
        }
    }
}

module.exports = SessionModel;