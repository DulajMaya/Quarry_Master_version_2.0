const { SOCKET_EVENTS } = require('../services/socketEvents');
const { Notification } = require('../../models');
const { NOTIFICATION_TYPES } = require('../../notifications/utils/notification.constants');

class NotificationHandler {
    constructor(io, socketManager) {
        this.io = io;
        this.socketManager = socketManager;
    }

    async sendNotification(notification) {
        try {
            // Send to specific user
            this.socketManager.emitToUser(
                notification.UserID, 
                SOCKET_EVENTS.NOTIFICATION, 
                {
                    id: notification.NotificationID,
                    type: notification.Type,
                    title: notification.Title,
                    message: notification.Message,
                    status: notification.Status,
                    createdAt: notification.createdAt,
                    referenceType: notification.ReferenceType,
                    referenceId: notification.ReferenceID
                }
            );

            return true;
        } catch (error) {
            console.error('Send notification error:', error);
            return false;
        }
    }

    async sendBulkNotifications(notifications) {
        try {
            // Group notifications by user
            const userNotifications = notifications.reduce((acc, notification) => {
                if (!acc[notification.UserID]) {
                    acc[notification.UserID] = [];
                }
                acc[notification.UserID].push(notification);
                return acc;
            }, {});

            // Send notifications to each user
            for (const [userId, userNotifs] of Object.entries(userNotifications)) {
                this.socketManager.emitToUser(userId, SOCKET_EVENTS.NOTIFICATION, userNotifs);
            }

            return true;
        } catch (error) {
            console.error('Bulk notifications error:', error);
            return false;
        }
    }

    async handleNotificationRead(socket, notificationId) {
        try {
            const notification = await Notification.findOne({
                where: {
                    NotificationID: notificationId,
                    UserID: socket.user.id
                }
            });

            if (notification) {
                await notification.update({
                    Status: 'READ',
                    ReadAt: new Date()
                });

                // Confirm to client
                socket.emit('notification_read_confirmed', {
                    notificationId,
                    status: 'READ',
                    readAt: notification.ReadAt
                });
            }
        } catch (error) {
            console.error('Notification read handler error:', error);
            socket.emit('notification_error', {
                message: 'Failed to mark notification as read'
            });
        }
    }

    async sendPermitNotification(data) {
        try {
            const notification = {
                type: NOTIFICATION_TYPES.PERMIT_STATUS,
                title: `Permit ${data.status}`,
                message: `Permit ${data.permitNumber} has been ${data.status.toLowerCase()}`,
                referenceType: 'PERMIT',
                referenceId: data.permitId,
                userId: data.userId
            };

            await this.sendNotification(notification);
        } catch (error) {
            console.error('Permit notification error:', error);
        }
    }

    async sendQuotaNotification(data) {
        try {
            const notification = {
                type: NOTIFICATION_TYPES.QUOTA_STATUS,
                title: `Quota ${data.status}`,
                message: `Weekly quota ${data.quotaNumber} has been ${data.status.toLowerCase()}`,
                referenceType: 'QUOTA',
                referenceId: data.quotaId,
                userId: data.userId
            };

            await this.sendNotification(notification);
        } catch (error) {
            console.error('Quota notification error:', error);
        }
    }

    async sendLowStockAlert(data) {
        try {
            const notification = {
                type: NOTIFICATION_TYPES.LOW_STOCK,
                title: 'Low Stock Alert',
                message: `Low stock detected for ${data.items.length} items in store ${data.storeId}`,
                referenceType: 'STORE',
                referenceId: data.storeId,
                userId: data.userId
            };

            await this.sendNotification(notification);
        } catch (error) {
            console.error('Low stock alert error:', error);
        }
    }

    registerHandlers(socket) {
        // Handle marking notifications as read
        socket.on(SOCKET_EVENTS.NOTIFICATION_READ, async (data) => {
            await this.handleNotificationRead(socket, data.notificationId);
        });

        // Handle notification acknowledgment
        socket.on('notification_received', (data) => {
            console.log(`Notification ${data.notificationId} received by user ${socket.user.id}`);
        });
    }
}

module.exports = NotificationHandler;