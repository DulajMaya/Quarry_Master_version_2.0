// services/notification/notification-triggers.js
/*
const notificationService = require('./notification.service');
const emailService = require('./email.service');
const { 
    User, 
    ExplosiveStore, 
    ExplosivePermit, 
    WeeklyQuota, 
    Purchase 
} = require('../../models');

class NotificationTriggers {
    /**
     * Handle Low Stock Notifications
     
    async handleLowStockTrigger(storeId, items) {
        try {
            // Get store details
            const store = await ExplosiveStore.findByPk(storeId, {
                include: [{
                    model: User,
                    as: 'SiteEngineer'
                }]
            });

            // Create notification data
            const notificationData = {
                userId: store.SiteEngineer.id,
                type: 'LOW_STOCK',
                title: 'Low Stock Alert',
                message: `Low stock alert for ${items.length} item(s) in ${store.StoreName}`,
                priority: 'HIGH',
                referenceType: 'STORE',
                referenceId: storeId,
                sendEmail: true,
                templateId: 'TPL_LOW_STOCK',
                emailContext: {
                    userName: store.SiteEngineer.name,
                    storeName: store.StoreName,
                    items: items.map(item => ({
                        explosiveType: item.ExplosiveType.TypeName,
                        currentQuantity: item.CurrentQuantity,
                        minimumLevel: item.MinimumLevel
                    }))
                }
            };

            await notificationService.createNotification(notificationData);

            return { success: true };
        } catch (error) {
            console.error('Low stock notification failed:', error);
            throw error;
        }
    }

    /**
     * Handle Permit Expiry Notifications
     
    async handlePermitExpiryTrigger(permitId) {
        try {
            const permit = await ExplosivePermit.findByPk(permitId, {
                include: [
                    { model: User, as: 'SiteEngineer' },
                    { model: User, as: 'Controller' }
                ]
            });

            // Calculate days until expiry
            const daysUntilExpiry = Math.ceil(
                (new Date(permit.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );

            // Notify both site engineer and controller
            const notifications = [
                {
                    userId: permit.SiteEngineer.id,
                    type: 'PERMIT_EXPIRY',
                    title: 'Permit Expiry Notice',
                    message: `Permit ${permit.PermitID} will expire in ${daysUntilExpiry} days`,
                    priority: daysUntilExpiry <= 7 ? 'HIGH' : 'MEDIUM',
                    referenceType: 'PERMIT',
                    referenceId: permitId,
                    sendEmail: true,
                    templateId: 'TPL_PERMIT_EXPIRY',
                    emailContext: {
                        userName: permit.SiteEngineer.name,
                        permitNumber: permit.PermitID,
                        expiryDate: permit.ExpiryDate,
                        daysRemaining: daysUntilExpiry
                    }
                },
                {
                    userId: permit.Controller.id,
                    type: 'PERMIT_EXPIRY',
                    title: 'Permit Expiry Notice',
                    message: `Permit ${permit.PermitID} will expire in ${daysUntilExpiry} days`,
                    priority: daysUntilExpiry <= 7 ? 'HIGH' : 'MEDIUM',
                    referenceType: 'PERMIT',
                    referenceId: permitId,
                    sendEmail: true,
                    templateId: 'TPL_PERMIT_EXPIRY_CONTROLLER',
                    emailContext: {
                        userName: permit.Controller.name,
                        permitNumber: permit.PermitID,
                        expiryDate: permit.ExpiryDate,
                        daysRemaining: daysUntilExpiry,
                        siteName: permit.SiteEngineer.site.name
                    }
                }
            ];

            await notificationService.createBulkNotifications(notifications);

            return { success: true };
        } catch (error) {
            console.error('Permit expiry notification failed:', error);
            throw error;
        }
    }

    /**
     * Handle Quota Status Notifications
     
    async handleQuotaStatusTrigger(quotaId, status) {
        try {
            const quota = await WeeklyQuota.findByPk(quotaId, {
                include: [
                    { 
                        model: ExplosivePermit,
                        include: [{ model: User, as: 'SiteEngineer' }]
                    },
                    { model: User, as: 'Approver' }
                ]
            });

            const notificationData = {
                userId: quota.ExplosivePermit.SiteEngineer.id,
                type: 'QUOTA_STATUS',
                title: `Quota ${status}`,
                message: `Your quota request ${quotaId} has been ${status.toLowerCase()}`,
                priority: 'MEDIUM',
                referenceType: 'QUOTA',
                referenceId: quotaId,
                sendEmail: true,
                templateId: 'TPL_QUOTA_STATUS',
                emailContext: {
                    userName: quota.ExplosivePermit.SiteEngineer.name,
                    quotaId: quota.QuotaID,
                    status: status,
                    approver: quota.Approver.name,
                    approvalDate: new Date(),
                    items: quota.QuotaItems.map(item => ({
                        explosiveType: item.ExplosiveType.TypeName,
                        requestedQuantity: item.RequestedQuantity,
                        approvedQuantity: item.ApprovedQuantity
                    }))
                }
            };

            await notificationService.createNotification(notificationData);

            return { success: true };
        } catch (error) {
            console.error('Quota status notification failed:', error);
            throw error;
        }
    }

    /**
     * Handle Purchase Status Notifications
     
    async handlePurchaseStatusTrigger(purchaseId, status) {
        try {
            const purchase = await Purchase.findByPk(purchaseId, {
                include: [
                    { model: User, as: 'SiteEngineer' },
                    { model: User, as: 'Dealer' }
                ]
            });

            // Create notifications for both site engineer and dealer
            const notifications = [
                {
                    userId: purchase.SiteEngineer.id,
                    type: 'PURCHASE_STATUS',
                    title: `Purchase Order ${status}`,
                    message: `Purchase order ${purchaseId} has been ${status.toLowerCase()}`,
                    priority: 'MEDIUM',
                    referenceType: 'PURCHASE',
                    referenceId: purchaseId,
                    sendEmail: true,
                    templateId: 'TPL_PURCHASE_STATUS_ENGINEER',
                    emailContext: {
                        userName: purchase.SiteEngineer.name,
                        purchaseId: purchase.PurchaseID,
                        status: status,
                        dealer: purchase.Dealer.name,
                        items: purchase.PurchaseItems.map(item => ({
                            explosiveType: item.ExplosiveType.TypeName,
                            quantity: item.Quantity,
                            unitPrice: item.UnitPrice,
                            totalPrice: item.TotalPrice
                        }))
                    }
                },
                {
                    userId: purchase.Dealer.id,
                    type: 'PURCHASE_STATUS',
                    title: `Purchase Order ${status}`,
                    message: `Purchase order ${purchaseId} status updated to ${status.toLowerCase()}`,
                    priority: 'MEDIUM',
                    referenceType: 'PURCHASE',
                    referenceId: purchaseId,
                    sendEmail: true,
                    templateId: 'TPL_PURCHASE_STATUS_DEALER',
                    emailContext: {
                        userName: purchase.Dealer.name,
                        purchaseId: purchase.PurchaseID,
                        status: status,
                        engineer: purchase.SiteEngineer.name,
                        site: purchase.SiteEngineer.site.name,
                        items: purchase.PurchaseItems.map(item => ({
                            explosiveType: item.ExplosiveType.TypeName,
                            quantity: item.Quantity,
                            unitPrice: item.UnitPrice,
                            totalPrice: item.TotalPrice
                        }))
                    }
                }
            ];

            await notificationService.createBulkNotifications(notifications);

            return { success: true };
        } catch (error) {
            console.error('Purchase status notification failed:', error);
            throw error;
        }
    }

    /**
     * Handle Delivery Notification
     
    async handleDeliveryTrigger(purchaseId) {
        try {
            const purchase = await Purchase.findByPk(purchaseId, {
                include: [
                    { model: User, as: 'SiteEngineer' },
                    { model: User, as: 'Dealer' }
                ]
            });

            const notificationData = {
                userId: purchase.SiteEngineer.id,
                type: 'DELIVERY',
                title: 'Delivery Scheduled',
                message: `Delivery scheduled for purchase order ${purchaseId}`,
                priority: 'HIGH',
                referenceType: 'PURCHASE',
                referenceId: purchaseId,
                sendEmail: true,
                templateId: 'TPL_DELIVERY_NOTIFICATION',
                emailContext: {
                    userName: purchase.SiteEngineer.name,
                    purchaseId: purchase.PurchaseID,
                    deliveryDate: purchase.DeliveryDate,
                    dealer: purchase.Dealer.name,
                    items: purchase.PurchaseItems
                }
            };

            await notificationService.createNotification(notificationData);

            return { success: true };
        } catch (error) {
            console.error('Delivery notification failed:', error);
            throw error;
        }
    }
}

module.exports = new NotificationTriggers();*/