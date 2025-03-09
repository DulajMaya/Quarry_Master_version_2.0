// notifications/services/notification.service.js
/*
const { 
    NOTIFICATION_TYPES, 
    DELIVERY_TYPES, 
    NOTIFICATION_PRIORITY 
} = require('../utils/notification.constants');
const emailService = require('./email.service');
const recipientService = require('./recipient.service');
const Notification = require('../models/notification.model');

class NotificationService {
    // Main notification creation method
    async createNotification(data) {
        try {
            const notification = await Notification.create({
                NotificationID: await this.generateNotificationId(),
                UserID: data.userId,
                Type: data.type,
                Title: data.title,
                Message: data.message,
                Status: 'UNREAD',
                Priority: data.priority || NOTIFICATION_PRIORITY.MEDIUM,
                ReferenceType: data.referenceType,
                ReferenceID: data.referenceId
            });

            if (data.deliveryType !== DELIVERY_TYPES.SYSTEM && data.emailTemplate) {
                for (const recipient of data.recipients) {
                    console.log(recipient);
                    await emailService.sendEmailWithRetry({
                        to: recipient.email,
                        template: data.emailTemplate,
                        subjectData: data.subjectData || {},
                        data: {
                            ...data.emailData,
                            userName: recipient.name
                        },
                        userId: recipient.id
                    }, notification.NotificationID);
                }
            }

            return notification;
        } catch (error) {
            console.log(error);
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Specialized notification methods
    async sendLowStockAlert(storeId, items) {
        try {
            const recipients = await recipientService.getStoreRecipients(storeId);
            
            await this.createNotification({
                type: NOTIFICATION_TYPES.LOW_STOCK,
                title: 'Low Stock Alert',
                message: `Low stock detected for ${items.length} items`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'STORE',
                referenceId: storeId,
                recipients,
                emailTemplate: 'LOW_STOCK_ALERT',
                emailData: { items }
            });
        } catch (error) {
            console.error('Error sending low stock alert:', error);
            throw error;
        }
    }

    async sendPermitStatusNotification(permitId, status, data, userId) {
        try {
            const recipients = await recipientService.getPermitRecipients(permitId);
            console.log(recipients);
            
            await this.createNotification({
                type: NOTIFICATION_TYPES.PERMIT_STATUS,
                userId: userId,
                title: `Permit ${status}`,
                message: `Permit ${data.permitNumber} has been ${status.toLowerCase()}`,
                priority: status === 'Rejected' ? NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PERMIT',
                referenceId: permitId,
                recipients,
                emailTemplate: 'PERMIT_STATUS',
                emailData: data,
                subjectData: { status }
            });
        } catch (error) {
            console.error('Error sending permit status notification:', error);
            throw error;
        }
    }

    async sendPurchaseStatusNotification(purchaseId, status, data) {
        try {
            const recipients = await recipientService.getPurchaseRecipients(purchaseId);
            
            await this.createNotification({
                type: NOTIFICATION_TYPES.PURCHASE_STATUS,
                title: `Purchase Order ${status}`,
                message: `Purchase order ${data.purchaseId} has been ${status.toLowerCase()}`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PURCHASE',
                referenceId: purchaseId,
                recipients,
                emailTemplate: 'PURCHASE_STATUS',
                emailData: data,
                subjectData: { status }
            });
        } catch (error) {
            console.error('Error sending purchase status notification:', error);
            throw error;
        }
    }

    // Helper method to generate notification ID
    async generateNotificationId() {
        const lastNotification = await Notification.findOne({
            order: [['NotificationID', 'DESC']]
        });

        const nextNumber = lastNotification 
            ? parseInt(lastNotification.NotificationID.slice(3)) + 1 
            : 1;

        return `NOT${nextNumber.toString().padStart(5, '0')}`;
    }

    // Method to get user's notifications
    async getUserNotifications(userId, options = {}) {
        const { status, limit = 10, offset = 0 } = options;

        const query = {
            where: { UserID: userId },
            order: [['CreatedAt', 'DESC']],
            limit,
            offset
        };

        if (status) {
            query.where.Status = status;
        }

        return await Notification.findAndCountAll(query);
    }

    // Method to mark notification as read
    async markAsRead(notificationId) {
        const notification = await Notification.findByPk(notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }

        await notification.update({
            Status: 'READ',
            ReadAt: new Date()
        });

        return notification;
    }
}

module.exports = new NotificationService();*/

// notifications/services/notification.service.js

const { 
    NOTIFICATION_TYPES, 
    DELIVERY_TYPES, 
    NOTIFICATION_PRIORITY,
    EMAIL_TEMPLATES,
    REFERENCE_TYPES
} = require('../utils/notification.constants');
const emailService = require('./email.service');
const recipientService = require('./recipient.service');
const Notification = require('../models/notification.model');
const {ExplosiveType} = require('../../models');
//const { getIO } = require('../../server');
const server = require('../../server');

class NotificationService {

    constructor() {
         // We'll get the io instance when needed instead of constructor
         this.io = null;
    }


      // Helper method to get io instance
      /*getIO() {
        if (!this.io) {
            try {
                this.io = getIO();
            } catch (error) {
                console.error('Socket.io not available:', error);
            }
        }
        return this.io;
    }*/
   // Update getIO method
   getIO() {
    try {
        if (!this.io) {
            const { getIO } = require('../../server');
            this.io = getIO();
        }
        return this.io;
    } catch (error) {
        console.warn('WebSocket not available:', error.message);
        return null; // Return null if WebSocket isn't available
    }
}



    async createNotification(data) {
        try {

            // Special handling for new user creation
        if (data.type === NOTIFICATION_TYPES.USER_CREDENTIALS) {
            // Skip user validation for credentials email
            // Only create notification log
            await this.sendInitialCredentialsEmail(data);
            return;
        }



            // Validate required fields
            if (!data.type || !data.userId) {
                throw new Error('Missing required notification data');
            }

            // Create notification record
            const notification = await Notification.create({
                NotificationID: await this.generateNotificationId(),
                UserID: data.userId,
                Type: data.type,
                Title: data.title,
                Message: data.message,
                Status: 'UNREAD',
                Priority: data.priority || NOTIFICATION_PRIORITY.MEDIUM,
                ReferenceType: data.referenceType,
                ReferenceID: data.referenceId
            });



            // Send real-time WebSocket notification
            /*const io = this.getIO();
            if (io && data.recipients?.length > 0) {
                const wsNotification = {
                    id: notification.NotificationID,
                    type: notification.Type,
                    title: notification.Title,
                    message: notification.Message,
                    priority: notification.Priority,
                    referenceType: notification.ReferenceType,
                    referenceId: notification.ReferenceID,
                    createdAt: notification.createdAt
                };

                data.recipients.forEach(recipient => {
                    io.to(`user:${recipient.id}`).emit('notification', wsNotification);
                });
            }*/

            // Try to send WebSocket notification if available
            const io = this.getIO();
            if (io && data.recipients?.length > 0) {
                const wsNotification = {
                    id: notification.NotificationID,
                    type: notification.Type,
                    title: notification.Title,
                    message: notification.Message,
                    priority: notification.Priority,
                    referenceType: notification.ReferenceType,
                    referenceId: notification.ReferenceID,
                    createdAt: notification.createdAt
                };

                data.recipients.forEach(recipient => {
                    io.to(`user:${recipient.id}`).emit('notification', wsNotification);
                });
            }

            // Send emails if required
            if (data.deliveryType !== DELIVERY_TYPES.SYSTEM && 
                data.emailTemplate && 
                data.recipients?.length > 0) {
                
                for (const recipient of data.recipients) {
                    console.log(recipient);
                    await emailService.sendEmailWithRetry({
                        to: recipient.email,
                        template: data.emailTemplate,
                        subjectData: data.subjectData || {},
                        data: {
                            ...data.emailData,
                            userName: recipient.name
                        },
                        userId: recipient.id
                    }, notification.NotificationID);
                }
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async sendInitialCredentialsEmail(data) {
        // Handle just the email sending without requiring user ID
        await emailService.sendEmailWithRetry({
            to: data.recipients[0].email,
            template: data.emailTemplate,
            data: data.emailData
        });
    }



    // WebSocket-specific notification for force logout
    async sendForceLogoutNotification(userId, reason) {
        try {
            // Send immediate WebSocket notification
            const io = this.getIO();
        if (io) {
            io.to(`user:${userId}`).emit('force_logout', {
                reason,
                timestamp: new Date()
            });
            };

            // Create system notification for record
            await this.createNotification({
                type: NOTIFICATION_TYPES.SYSTEM,
                userId,
                title: 'Account Session Terminated',
                message: reason,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.SYSTEM,
                referenceType: REFERENCE_TYPES.USER,
                referenceId: userId,
                recipients: [{ id: userId }]
            });
        } catch (error) {
            console.error('Force logout notification error:', error);
            throw error;
        }
    }

    // Permit Notifications
    async sendPermitStatusNotification(permitId, status, data, userId, { controllerId, miningSiteId } = {}) {
        try {
            const recipients = await recipientService.getPermitRecipients(permitId, { 
                controllerId, 
                miningSiteId 
            });
            console.log(recipients);

            if (!recipients.length) {
                console.warn('No recipients found for permit notification');
                return;
            }


            // Send real-time WebSocket update
            const io = this.getIO();
        if (io) {
            recipients.forEach(recipient => {
                io.to(`user:${recipient.id}`).emit('permit_status_changed', {
                    permitId,
                    status,
                    permitNumber: data.permitNumber,
                    updatedAt: new Date(),
                    ...data
                });
            });
        }

            // Create persistent notification

            await this.createNotification({
                type: NOTIFICATION_TYPES.PERMIT_STATUS,
                userId: userId,
                title: `Permit ${status}`,
                message: `Permit ${data.permitNumber} has been ${status.toLowerCase()}`,
                priority: status === 'Rejected' ? NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: REFERENCE_TYPES.PERMIT,
                referenceId: permitId,
                recipients,
                emailTemplate: 'PERMIT_STATUS',
                emailData: data,
                subjectData: { status, permitNumber: data.permitNumber }
            });
        } catch (error) {
            console.error('Error sending permit notification:', error);
            throw error;
        }
    }


    async sendQuotaStatusNotification(quotaId, status, data, userId) {
        try {
            const recipients = await recipientService.getQuotaRecipients(quotaId);
     
            if (!recipients.length) {
                console.warn('No recipients found for quota notification');
                return;
            }
             // Fetch explosive types first

             const explosiveTypes = await ExplosiveType.findAll();
             const formattedItems = data.items.map(item => {
                const type = explosiveTypes.find(t => t.ExplosiveTypeID === item.explosiveTypeId || item.explosiveType);
                return {
                    explosiveType: type ? type.TypeName : (item.explosiveTypeId || item.explosiveType),
                    quantity: item.quantity,
                    unit: item.unit,
                    requestedQuantity: item.requestedQuantity || `${item.quantity} ${item.unit}`,
                    remarks: item.remarks || '-'
                };
            });
     
            await this.createNotification({
                type: NOTIFICATION_TYPES.QUOTA_STATUS,
                userId: userId,
                title: `Quota Request ${status}`,
                message: `Weekly quota request ${data.quotaId} has been ${status.toLowerCase()}`,
                priority: status === 'Rejected' ? NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: REFERENCE_TYPES.QUOTA,
                referenceId: quotaId,
                recipients,
                emailTemplate: 'QUOTA_STATUS',
                emailData: {
                    quotaId: data.quotaId,
                    permitNumber: data.permitNumber,
                    status: status,
                    remarks: data.remarks,
                    items: formattedItems,
                    approvalDate: data.approvalDate,
                    purpose: data.purpose,
                    plannedUsageDate: data.plannedUsageDate
                },
                subjectData: { status, quotaId: data.quotaId }
            });
        } catch (error) {
            console.error('Error sending quota notification:', error);
            throw error;
        }
     }

    // Low Stock Notifications
    async sendLowStockAlert(storeId, items, userId) {
        try {
            const recipients = await recipientService.getStoreRecipients(storeId);
            
            if (!recipients.length) {
                console.warn('No recipients found for low stock notification');
                return;
            }


            const io = this.getIO();
        if (io) {
            recipients.forEach(recipient => {
                io.to(`user:${recipient.id}`).emit('low_stock_alert', {
                    storeId,
                    items,
                    timestamp: new Date()
                });
            });

        }

            // Create persistent notification

            await this.createNotification({
                type: NOTIFICATION_TYPES.LOW_STOCK,
                userId: userId,
                title: 'Low Stock Alert',
                message: `Low stock detected for ${items.length} items`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: REFERENCE_TYPES.STORE,
                referenceId: storeId,
                recipients,
                emailTemplate: 'LOW_STOCK_ALERT',
                emailData: { items }
            });
        } catch (error) {
            console.error('Error sending low stock alert:', error);
            throw error;
        }
    }

    // Helper method to generate notification ID
    async generateNotificationId() {
        try {
            const lastNotification = await Notification.findOne({
                order: [['NotificationID', 'DESC']]
            });

            const nextNumber = lastNotification 
                ? parseInt(lastNotification.NotificationID.slice(3)) + 1 
                : 1;

            return `NOT${nextNumber.toString().padStart(5, '0')}`;
        } catch (error) {
            console.error('Error generating notification ID:', error);
            throw error;
        }
    }


    // In notification.service.js
async sendPurchaseStatusNotification(purchaseId, status, data, userId) {
    try {
        const recipients = await recipientService.getPurchaseRecipients(purchaseId);
 
        if (!recipients.length) {
            console.warn('No recipients found for purchase notification');
            return;
        }
 
        await this.createNotification({
            type: NOTIFICATION_TYPES.PURCHASE_STATUS,
            userId: userId,
            title: `Purchase Order ${status}`,
            message: `Purchase order ${data.purchaseId} has been ${status.toLowerCase()}`,
            priority: ['Cancelled', 'Rejected'].includes(status) ? 
                NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
            deliveryType: DELIVERY_TYPES.BOTH,
            referenceType: REFERENCE_TYPES.PURCHASE,
            referenceId: purchaseId,
            recipients,
            emailTemplate: 'PURCHASE_STATUS',
            emailData: {
                purchaseId: data.purchaseId,
                status: status,
                orderDate: data.orderDate,
                storeName: data.storeName,
                items: data.items.map(item => ({
                    explosiveType: item.explosiveType,
                    quantity: item.quantity,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice
                })),
                totalAmount: data.totalAmount,
                remarks: data.remarks,
                receivedDate: data.receivedDate,
                receiptNumber: data.receiptNumber
            },
            subjectData: { 
                status,
                purchaseId: data.purchaseId 
            }
        });
    } catch (error) {
        console.error('Error sending purchase notification:', error);
        throw error;
    }
 }

 async sendPurchaseCreatedNotification(purchaseId, status, data, userId) {
    return this.sendPurchaseStatusNotification(purchaseId, 'Created', {
        purchaseId,
        orderDate: data.orderDate,
        storeName: data.storeName,
        dealerName: data.dealerName,
        status: 'Created',
        items: data.items.map(item => ({
            explosiveType: item.explosiveType,
            quantity: item.quantity
        })),
        paymentMethod: data.paymentMethod,
        notes: data.notes
    }, userId);
 }

 async sendPurchaseConfirmedNotification(purchaseId, data, userId) {
    return this.sendPurchaseStatusNotification(purchaseId, 'Confirmed', {
        purchaseId,
        orderDate: data.orderDate,
        confirmationDate: data.confirmationDate,
        storeName: data.storeName,
        dealerName: data.dealerName,
        items: data.items.map(item => ({
            explosiveType: item.explosiveType,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            batchNumber: item.batchNumber
        })),
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod
    }, userId);
 }

 async sendPurchaseDeliveredNotification(purchaseId, data, userId) {
    return this.sendPurchaseStatusNotification(purchaseId, 'Delivered', {
        purchaseId,
        orderDate: data.orderDate,
        deliveryDate: data.deliveryDate,
        storeName: data.storeName,
        dealerName: data.dealerName,
        items: data.items.map(item => ({
            explosiveType: item.explosiveType,
            quantity: item.quantity,
            receivedQuantity: item.receivedQuantity,
            batchNumber: item.batchNumber
        })),
        totalAmount: data.totalAmount
    }, userId);
 }

/* async sendUserCredentials(email, { username, password, userType }) {
    try {
        await this.createNotification({
            type: NOTIFICATION_TYPES.USER_CREDENTIALS,
            title: 'Account Credentials',
            message: 'Your account credentials have been created',
            deliveryType: DELIVERY_TYPES.EMAIL,
            recipients: [{
                email,
                name: username
            }],
            emailTemplate: 'USER_CREDENTIALS',
            emailData: {
                username,
                password,
                userType,
                loginUrl: process.env.FRONTEND_URL,
                userName: username
            }
        });
    } catch (error) {
        console.error('Error sending credentials:', error);
        throw error;
    }
}*/

async sendUserCredentials(email, { username, password, userType }) {
    try {
        await this.createNotification({
            type: NOTIFICATION_TYPES.USER_CREDENTIALS,
            title: 'Account Credentials',
            message: 'Your account credentials have been created',
            deliveryType: DELIVERY_TYPES.EMAIL,
            recipients: [{
     
                email,
                name: username
            }],
            emailTemplate: 'USER_CREDENTIALS',
            emailData: {
                username,
                password,
                userType,
                loginUrl: process.env.FRONTEND_URL,
                userName: username,
                expiryTime: '24 hours',
                createdAt: new Date().toISOString()
            },

            priority: NOTIFICATION_PRIORITY.HIGH
        });
    } catch (error) {
        console.error('Error sending credentials:', error);
        throw error;
    }
}

 async sendPaymentStatusNotification(purchaseId, data, userId) {
    const recipients = await recipientService.getPurchaseRecipients(purchaseId);
 
    return this.createNotification({
        type: NOTIFICATION_TYPES.PAYMENT_STATUS,
        userId: userId,
        title: `Payment ${data.paymentStatus}`,
        message: `Payment for purchase ${purchaseId} has been ${data.paymentStatus.toLowerCase()}`,
        priority: NOTIFICATION_PRIORITY.HIGH,
        deliveryType: DELIVERY_TYPES.BOTH,
        referenceType: REFERENCE_TYPES.PURCHASE,
        referenceId: purchaseId,
        recipients,
        emailTemplate: 'PAYMENT_STATUS',
        emailData: {
            purchaseId,
            paymentStatus: data.paymentStatus,
            paymentDate: data.paymentDate,
            paymentReference: data.paymentReference,
            amount: data.amount,
            paymentMethod: data.paymentMethod
        },
        subjectData: { 
            status: data.paymentStatus,
            purchaseId 
        }
    });
 }











}

module.exports = new NotificationService();