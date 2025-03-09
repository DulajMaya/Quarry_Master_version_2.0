// notifications/controllers/notification.controller.js

const notificationService = require('../services/notification.service');

class NotificationController {
    // Get user notifications with pagination
    async getUserNotifications(req, res) {
        try {
            const { status, page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const notifications = await notificationService.getUserNotifications(
                req.userId,
                { status, limit, offset }
            );

            res.status(200).json({
                status: 'success',
                data: notifications.rows,
                pagination: {
                    total: notifications.count,
                    page: parseInt(page),
                    totalPages: Math.ceil(notifications.count / limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Mark notification as read
    async markAsRead(req, res) {
        try {
            const { notificationId } = req.params;
            const notification = await notificationService.markAsRead(
                notificationId,
                req.userId
            );

            res.status(200).json({
                status: 'success',
                data: notification
            });
        } catch (error) {
            res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Mark all notifications as read
    async markAllAsRead(req, res) {
        try {
            await notificationService.markAllAsRead(req.userId);
            res.status(200).json({
                status: 'success',
                message: 'All notifications marked as read'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new NotificationController();