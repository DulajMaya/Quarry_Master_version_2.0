// services/notification/notification.service.js
/*
const { 
    Notification, 
    NotificationLog, 
    NotificationTemplate, 
    User 
} = require('../../models');
const emailService = require('./email.service');
const { generateNotificationId } = require('../id-generator.service');
const { Op } = require('sequelize');

class NotificationService {
    /**
     * Create and send notification
     
    async createNotification(data) {
        const transaction = await sequelize.transaction();

        try {
            const notificationId = await generateNotificationId();

            // Create notification record
            const notification = await Notification.create({
                NotificationID: notificationId,
                UserID: data.userId,
                Type: data.type,
                Title: data.title,
                Message: data.message,
                Priority: data.priority || 'MEDIUM',
                ReferenceType: data.referenceType,
                ReferenceID: data.referenceId,
                ExpiresAt: data.expiresAt
            }, { transaction });

            // If email notification is required
            if (data.sendEmail && data.templateId) {
                const user = await User.findByPk(data.userId);
                
                await emailService.sendTemplatedEmail({
                    to: user.email,
                    templateId: data.templateId,
                    context: data.emailContext,
                    userId: data.userId,
                    notificationId: notificationId
                });
            }

            await transaction.commit();
            return notification;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Create bulk notifications
     
    async createBulkNotifications(notifications) {
        const results = [];

        for (const notifData of notifications) {
            try {
                const notification = await this.createNotification(notifData);
                results.push({
                    success: true,
                    notificationId: notification.NotificationID
                });
            } catch (error) {
                results.push({
                    success: false,
                    error: error.message,
                    data: notifData
                });
            }
        }

        return {
            total: notifications.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results
        };
    }

    /**
     * Mark notification as read
     
    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            where: {
                NotificationID: notificationId,
                UserID: userId
            }
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.update({
            Status: 'READ',
            ReadAt: new Date()
        });

        return notification;
    }

    /**
     * Get user notifications
     
    async getUserNotifications(userId, options = {}) {
        const { status, type, page = 1, limit = 10 } = options;

        const whereClause = {
            UserID: userId
        };

        if (status) {
            whereClause.Status = status;
        }

        if (type) {
            whereClause.Type = type;
        }

        const notifications = await Notification.findAndCountAll({
            where: whereClause,
            order: [['CreatedAt', 'DESC']],
            limit: limit,
            offset: (page - 1) * limit
        });

        return {
            notifications: notifications.rows,
            total: notifications.count,
            page,
            totalPages: Math.ceil(notifications.count / limit)
        };
    }

    /**
     * Get unread notification count
     
    async getUnreadCount(userId) {
        return await Notification.count({
            where: {
                UserID: userId,
                Status: 'UNREAD'
            }
        });
    }

    /**
     * Delete expired notifications
     
    async deleteExpiredNotifications() {
        const result = await Notification.destroy({
            where: {
                ExpiresAt: {
                    [Op.lt]: new Date()
                },
                Status: {
                    [Op.ne]: 'ARCHIVED'
                }
            }
        });

        return {
            deletedCount: result
        };
    }

    /**
     * Archive notifications
     
    async archiveNotifications(userId, notificationIds) {
        const result = await Notification.update(
            {
                Status: 'ARCHIVED'
            },
            {
                where: {
                    UserID: userId,
                    NotificationID: {
                        [Op.in]: notificationIds
                    }
                }
            }
        );

        return {
            updatedCount: result[0]
        };
    }

    /**
     * Create system notification
     
    async createSystemNotification(data) {
        // Get users based on criteria
        const users = await User.findAll({
            where: data.userCriteria
        });

        const notifications = users.map(user => ({
            userId: user.id,
            type: 'SYSTEM',
            title: data.title,
            message: data.message,
            priority: data.priority,
            sendEmail: data.sendEmail,
            templateId: data.templateId,
            emailContext: {
                ...data.emailContext,
                userName: user.username
            }
        }));

        return await this.createBulkNotifications(notifications);
    }

    /**
     * Get notification statistics
     
    async getNotificationStats(userId) {
        const stats = await Notification.findAll({
            where: { UserID: userId },
            attributes: [
                'Type',
                'Status',
                [sequelize.fn('COUNT', sequelize.col('NotificationID')), 'count']
            ],
            group: ['Type', 'Status']
        });

        return stats.reduce((acc, stat) => {
            if (!acc[stat.Type]) {
                acc[stat.Type] = {};
            }
            acc[stat.Type][stat.Status] = stat.get('count');
            return acc;
        }, {});
    }
}

module.exports = new NotificationService();*/