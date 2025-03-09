const { SOCKET_EVENTS } = require('../services/socketEvents');
const { Purchase, User, Role, ExplosiveDealer } = require('../../models');

class PurchaseHandler {
    constructor(io, socketManager) {
        this.io = io;
        this.socketManager = socketManager;
    }

    async handlePurchaseStatusChange(purchaseId, status, updatedBy) {
        try {
            const purchase = await Purchase.findOne({
                where: { PurchaseID: purchaseId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    },
                    {
                        model: ExplosiveDealer,
                        include: [{
                            model: User,
                            include: [{ model: Role }]
                        }]
                    }
                ]
            });

            if (!purchase) {
                throw new Error('Purchase not found');
            }

            // Prepare status change notification
            const statusNotification = {
                purchaseId,
                purchaseNumber: purchase.PurchaseNumber,
                status,
                updatedAt: new Date(),
                updatedBy,
                items: purchase.items // Purchase items details
            };

            // Notify site engineer
            if (purchase.SiteEngineer) {
                this.socketManager.emitToUser(
                    purchase.SiteEngineer.id,
                    SOCKET_EVENTS.PURCHASE_STATUS_CHANGED,
                    statusNotification
                );
            }

            // Notify dealer
            if (purchase.ExplosiveDealer?.User) {
                this.socketManager.emitToUser(
                    purchase.ExplosiveDealer.User.id,
                    SOCKET_EVENTS.PURCHASE_STATUS_CHANGED,
                    statusNotification
                );
            }

            // Notify relevant explosive controllers
            const controllers = await User.findAll({
                where: {
                    reference_type: 'EXPLOSIVE_CONTROLLER'
                },
                include: [
                    {
                        model: Role,
                        where: { name: 'ROLE_EXPLOSIVE_CONTROLLER' }
                    }
                ]
            });

            controllers.forEach(controller => {
                this.socketManager.emitToUser(
                    controller.id,
                    SOCKET_EVENTS.PURCHASE_STATUS_CHANGED,
                    statusNotification
                );
            });

            return true;
        } catch (error) {
            console.error('Purchase status change error:', error);
            return false;
        }
    }

    async handlePaymentUpdate(purchaseId, paymentData) {
        try {
            const purchase = await Purchase.findOne({
                where: { PurchaseID: purchaseId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    },
                    {
                        model: ExplosiveDealer,
                        include: [{
                            model: User,
                            include: [{ model: Role }]
                        }]
                    }
                ]
            });

            if (!purchase) {
                throw new Error('Purchase not found');
            }

            // Prepare payment notification
            const paymentNotification = {
                purchaseId,
                purchaseNumber: purchase.PurchaseNumber,
                paymentStatus: paymentData.status,
                amount: paymentData.amount,
                paymentDate: paymentData.date,
                paymentMethod: paymentData.method,
                reference: paymentData.reference,
                updatedAt: new Date()
            };

            // Notify relevant parties
            [
                purchase.SiteEngineer?.id,
                purchase.ExplosiveDealer?.User?.id
            ].filter(Boolean).forEach(userId => {
                this.socketManager.emitToUser(
                    userId,
                    'payment_status_updated',
                    paymentNotification
                );
            });

            return true;
        } catch (error) {
            console.error('Payment update error:', error);
            return false;
        }
    }

    async handleDeliveryUpdate(purchaseId, deliveryData) {
        try {
            const purchase = await Purchase.findOne({
                where: { PurchaseID: purchaseId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    },
                    {
                        model: ExplosiveDealer,
                        include: [{
                            model: User,
                            include: [{ model: Role }]
                        }]
                    }
                ]
            });

            if (!purchase) {
                throw new Error('Purchase not found');
            }

            // Prepare delivery notification
            const deliveryNotification = {
                purchaseId,
                purchaseNumber: purchase.PurchaseNumber,
                deliveryStatus: deliveryData.status,
                expectedDate: deliveryData.expectedDate,
                actualDate: deliveryData.actualDate,
                updatedAt: new Date(),
                items: deliveryData.items // Delivered items details
            };

            // Notify relevant parties
            [
                purchase.SiteEngineer?.id,
                purchase.ExplosiveDealer?.User?.id
            ].filter(Boolean).forEach(userId => {
                this.socketManager.emitToUser(
                    userId,
                    'delivery_status_updated',
                    deliveryNotification
                );
            });

            return true;
        } catch (error) {
            console.error('Delivery update error:', error);
            return false;
        }
    }

    registerHandlers(socket) {
        const { user } = socket;

        if (!user) return;

        // Listen for purchase status updates
        socket.on('update_purchase_status', async (data) => {
            const allowedRoles = ['ROLE_ADMIN', 'ROLE_EXPLOSIVE_DEALER', 'ROLE_SITE_ENGINEER'];
            if (allowedRoles.includes(user.Role.name)) {
                await this.handlePurchaseStatusChange(data.purchaseId, data.status, user.id);
            }
        });

        // Listen for payment updates
        socket.on('update_payment_status', async (data) => {
            if (['ROLE_ADMIN', 'ROLE_SITE_ENGINEER'].includes(user.Role.name)) {
                await this.handlePaymentUpdate(data.purchaseId, data.paymentData);
            }
        });

        // Listen for delivery updates
        socket.on('update_delivery_status', async (data) => {
            if (['ROLE_ADMIN', 'ROLE_EXPLOSIVE_DEALER'].includes(user.Role.name)) {
                await this.handleDeliveryUpdate(data.purchaseId, data.deliveryData);
            }
        });
    }
}

module.exports = PurchaseHandler;