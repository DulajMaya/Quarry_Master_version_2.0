const { SOCKET_EVENTS } = require('../services/socketEvents');
const SessionModel = require('../models/session.model');
const { UserSession } = require('../../models');
const socketUtils = require('../utils/socketUtils');

class AuthHandler {
    constructor(io, socketManager) {
        this.io = io;
        this.socketManager = socketManager;
    }

    async handleConnection(socket) {
        try {
            const { user } = socket;
            
            if (!user) {
                socket.disconnect(true);
                return;
            }

            // Join user-specific room
            socket.join(`user:${user.id}`);

            // Update session with connection time
            const session = new SessionModel(user.id, socket.id);
            await session.update({
                lastActivity: new Date().toISOString(),
                status: 'connected'
            });

            // Update database session
            await UserSession.update(
                { lastActivity: new Date() },
                { 
                    where: { 
                        socketId: socket.id,
                        userId: user.id 
                    }
                }
            );

            console.log(`User ${user.id} connected with socket ${socket.id}`);
        } catch (error) {
            console.error('Connection handler error:', error);
            socket.disconnect(true);
        }
    }

    async handleDisconnect(socket) {
        try {
            const { user } = socket;
            
            if (user) {
                // Update Redis session
                const session = new SessionModel(user.id, socket.id);
                await session.update({
                    lastActivity: new Date().toISOString(),
                    status: 'disconnected'
                });

                // Update database session
                await UserSession.update(
                    { 
                        lastActivity: new Date(),
                        isActive: false 
                    },
                    { 
                        where: { 
                            socketId: socket.id,
                            userId: user.id 
                        }
                    }
                );

                console.log(`User ${user.id} disconnected from socket ${socket.id}`);
            }
        } catch (error) {
            console.error('Disconnect handler error:', error);
        }
    }

    async handleForceLogout(userId, reason = 'Session terminated by admin') {
        try {
            // Get all active sessions for user
            const sessions = await UserSession.findAll({
                where: { 
                    userId,
                    isActive: true
                }
            });

            // Emit force logout event to all user's sockets
            this.socketManager.emitToUser(userId, SOCKET_EVENTS.FORCE_LOGOUT, { reason });

            // Terminate all sessions
            await this.socketManager.sessionManager.terminateUserSessions(userId);

            console.log(`Force logout executed for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Force logout handler error:', error);
            return false;
        }
    }

    async handleSessionExpired(socket) {
        try {
            const { user } = socket;
            
            if (user) {
                socket.emit(SOCKET_EVENTS.SESSION_EXPIRED, {
                    message: 'Your session has expired. Please log in again.'
                });
                
                await this.socketManager.sessionManager.terminateSession(socket.id);
            }
        } catch (error) {
            console.error('Session expired handler error:', error);
        }
    }

    registerHandlers(socket) {
        socket.on(SOCKET_EVENTS.DISCONNECT, () => this.handleDisconnect(socket));
        
        // Additional auth-related event handlers can be registered here
        socket.on('refresh_token', async (data) => {
            // Handle token refresh logic
        });
    }
}

module.exports = AuthHandler;