const { SOCKET_EVENTS } = require('./socketEvents');
const SessionManager = require('./sessionManager');

class SocketManager {
    constructor(io) {
        this.io = io;
        this.sessionManager = new SessionManager(io);
    }

    // Emit to specific user
    emitToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }

    // Emit to specific role
    emitToRole(role, event, data) {
        this.io.to(`role:${role}`).emit(event, data);
    }

    // Force logout user
    async forceLogoutUser(userId, reason = 'Session terminated by admin') {
        try {
            this.emitToUser(userId, SOCKET_EVENTS.FORCE_LOGOUT, { reason });
            await this.sessionManager.terminateUserSessions(userId);
        } catch (error) {
            console.error('Force logout error:', error);
        }
    }

    // Send notification
    sendNotification(userId, notification) {
        this.emitToUser(userId, SOCKET_EVENTS.NOTIFICATION, notification);
    }

    // Update permit status
    updatePermitStatus(userId, permitData) {
        this.emitToUser(userId, SOCKET_EVENTS.PERMIT_STATUS_CHANGED, permitData);
    }

    // Send inventory alert
    sendInventoryAlert(storeId, alertData) {
        this.io.to(`store:${storeId}`).emit(SOCKET_EVENTS.LOW_STOCK_ALERT, alertData);
    }

    // Update purchase status
    updatePurchaseStatus(userId, purchaseData) {
        this.emitToUser(userId, SOCKET_EVENTS.PURCHASE_STATUS_CHANGED, purchaseData);
    }

    // Handle disconnection
    async handleDisconnect(socket) {
        try {
            if (socket.user) {
                await this.sessionManager.terminateSession(socket.id);
            }
        } catch (error) {
            console.error('Disconnect handling error:', error);
        }
    }

    // Initialize global error handling
    initializeErrorHandling() {
        this.io.on('error', (error) => {
            console.error('Socket.IO error:', error);
        });
    }
}

module.exports = SocketManager;