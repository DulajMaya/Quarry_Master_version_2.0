const { UserSession } = require('../../models');
const SessionModel = require('../models/session.model');
const { Op } = require('sequelize');

class SessionManager {
    constructor(io) {
        this.io = io;
    }

    // Add this new method
    async getActiveSessions(userId) {
        try {
            const sessions = await UserSession.findAll({
                where: {
                    userId,
                    isActive: true,
                    expiresAt: {
                        [Op.gt]: new Date() // not expired
                    }
                }
            });
            
            // Also check Redis sessions
            const redisSessions = await SessionModel.getUserSessions(userId);
            
            return {
                dbSessions: sessions,
                redisSessions: redisSessions
            };
        } catch (error) {
            console.error('Error getting active sessions:', error);
            throw error;
        }
    }

    async createSession(userId, socketId, token, deviceInfo = {}) {
        try {
            // Create Redis session
            const sessionModel = new SessionModel(userId, socketId);
            await sessionModel.save({ token });

            // Create database session
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

            const session = await UserSession.create({
                userId,
                socketId,
                token,
                deviceInfo,
                expiresAt
            });

            return session;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    async terminateSession(socketId) {
        try {
            // Find and update database session
            const session = await UserSession.findOne({
                where: { socketId, isActive: true }
            });

            if (session) {
                await session.update({
                    isActive: false,
                    lastActivity: new Date()
                });

                // Remove Redis session
                const sessionModel = new SessionModel(session.userId, socketId);
                await sessionModel.delete();

                // Disconnect socket
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.disconnect(true);
                }
            }
        } catch (error) {
            console.error('Error terminating session:', error);
            throw error;
        }
    }

    async terminateUserSessions(userId) {
        try {
            // Find all active sessions for user
            const sessions = await UserSession.findAll({
                where: {
                    userId,
                    isActive: true
                }
            });

            // Remove Redis sessions
            await SessionModel.deleteUserSessions(userId);

            // Update database sessions
            await UserSession.update(
                {
                    isActive: false,
                    lastActivity: new Date()
                },
                {
                    where: {
                        userId,
                        isActive: true
                    }
                }
            );

            // Disconnect all sockets
            sessions.forEach(session => {
                const socket = this.io.sockets.sockets.get(session.socketId);
                if (socket) {
                    socket.emit('force_logout', { reason: 'User session terminated' });
                    socket.disconnect(true);
                }
            });
        } catch (error) {
            console.error('Error terminating user sessions:', error);
            throw error;
        }
    }

    async updateSessionActivity(socketId) {
        try {
            const session = await UserSession.findOne({
                where: { socketId, isActive: true }
            });

            if (session) {
                await session.updateActivity();
                
                // Update Redis session
                const sessionModel = new SessionModel(session.userId, socketId);
                await sessionModel.update({ lastActivity: new Date() });
            }
        } catch (error) {
            console.error('Error updating session activity:', error);
            throw error;
        }
    }

    async cleanupExpiredSessions() {
        try {
            const expiredSessions = await UserSession.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { expiresAt: { [Op.lt]: new Date() } },
                        { lastActivity: { [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                    ]
                }
            });

            for (const session of expiredSessions) {
                await this.terminateSession(session.socketId);
            }
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
            throw error;
        }
    }
}

module.exports = SessionManager;