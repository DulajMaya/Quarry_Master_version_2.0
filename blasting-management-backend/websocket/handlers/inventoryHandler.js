const { SOCKET_EVENTS } = require('../services/socketEvents');
const { ExplosiveStore, StoreInventory, User, Role } = require('../../models');

class InventoryHandler {
    constructor(io, socketManager) {
        this.io = io;
        this.socketManager = socketManager;
    }

    async handleInventoryUpdate(storeId, updates) {
        try {
            const store = await ExplosiveStore.findOne({
                where: { StoreID: storeId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    }
                ]
            });

            if (!store) {
                throw new Error('Store not found');
            }

            // Prepare inventory update notification
            const updateNotification = {
                storeId,
                updates: updates.map(update => ({
                    explosiveTypeId: update.explosiveTypeId,
                    previousQuantity: update.previousQuantity,
                    newQuantity: update.newQuantity,
                    unit: update.unit,
                    updateType: update.type // 'ADDITION' or 'REDUCTION'
                })),
                updatedAt: new Date()
            };

            // Notify site engineer
            if (store.SiteEngineer) {
                this.socketManager.emitToUser(
                    store.SiteEngineer.id,
                    SOCKET_EVENTS.STORE_INVENTORY_UPDATED,
                    updateNotification
                );
            }

            // Notify explosive controllers in the district
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
                    SOCKET_EVENTS.STORE_INVENTORY_UPDATED,
                    updateNotification
                );
            });

            // Check for low stock after update
            await this.checkLowStock(storeId);

            return true;
        } catch (error) {
            console.error('Inventory update error:', error);
            return false;
        }
    }

    async handleLowStockAlert(storeId, items) {
        try {
            const store = await ExplosiveStore.findOne({
                where: { StoreID: storeId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    }
                ]
            });

            if (!store) {
                throw new Error('Store not found');
            }

            const alertData = {
                storeId,
                storeName: store.StoreName,
                items: items.map(item => ({
                    explosiveTypeId: item.explosiveTypeId,
                    typeName: item.typeName,
                    currentQuantity: item.currentQuantity,
                    thresholdQuantity: item.thresholdQuantity,
                    unit: item.unit
                })),
                alertedAt: new Date()
            };

            // Notify site engineer
            if (store.SiteEngineer) {
                this.socketManager.emitToUser(
                    store.SiteEngineer.id,
                    SOCKET_EVENTS.LOW_STOCK_ALERT,
                    alertData
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
                    SOCKET_EVENTS.LOW_STOCK_ALERT,
                    alertData
                );
            });

            return true;
        } catch (error) {
            console.error('Low stock alert error:', error);
            return false;
        }
    }

    async checkLowStock(storeId) {
        try {
            const inventory = await StoreInventory.findAll({
                where: { StoreID: storeId }
            });

            const lowStockItems = [];

            for (const item of inventory) {
                if (item.CurrentQuantity <= item.ThresholdQuantity) {
                    lowStockItems.push({
                        explosiveTypeId: item.ExplosiveTypeID,
                        typeName: item.ExplosiveType.TypeName,
                        currentQuantity: item.CurrentQuantity,
                        thresholdQuantity: item.ThresholdQuantity,
                        unit: item.Unit
                    });
                }
            }

            if (lowStockItems.length > 0) {
                await this.handleLowStockAlert(storeId, lowStockItems);
            }
        } catch (error) {
            console.error('Check low stock error:', error);
        }
    }

    registerHandlers(socket) {
        const { user } = socket;

        if (!user) return;

        // Listen for inventory updates
        socket.on('inventory_update', async (data) => {
            if (user.Role.name === 'ROLE_SITE_ENGINEER' || user.Role.name === 'ROLE_ADMIN') {
                await this.handleInventoryUpdate(data.storeId, data.updates);
            }
        });

        // Listen for manual stock checks
        socket.on('check_stock_levels', async (data) => {
            if (user.Role.name === 'ROLE_SITE_ENGINEER' || user.Role.name === 'ROLE_ADMIN') {
                await this.checkLowStock(data.storeId);
            }
        });
    }
}

module.exports = InventoryHandler;