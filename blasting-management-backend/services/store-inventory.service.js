const { StoreInventory, InventoryMovement, ExplosiveStore, ExplosiveType } = require('../models');
const { generateInventoryId, generateMovementId , generateBulkMovementIds} = require('../services/id-generator.service');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');
const notificationTriggers = require('./notification/notification-triggers');
const notificationService = require('../notifications/services/notification.service');

exports.initializeInventory = async (storeId, explosiveTypeId, data) => {
    const transaction = await sequelize.transaction();
    try {
        const inventoryId = await generateInventoryId();

        const inventory = await StoreInventory.create({
            InventoryID: inventoryId,
            StoreID: storeId,
            ExplosiveTypeID: explosiveTypeId,
            CurrentQuantity: 0,
            MinimumLevel: data.minimumLevel,
            MaximumLevel: data.maximumLevel,
            Status: 'OutOfStock'
        }, { transaction });

        await transaction.commit();
        return inventory;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};
/*
exports.updateInventory = async (inventoryId, quantity, movementType, referenceData, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const inventory = await StoreInventory.findByPk(inventoryId, { transaction });
        if (!inventory) {
            throw { status: 404, message: 'Inventory not found' };
        }

        const previousQuantity = Number(inventory.CurrentQuantity);
        let newQuantity;

        if (movementType === 'IN') {
            newQuantity = previousQuantity + Number(quantity);
            
            // Validate against maximum level
            if (newQuantity > inventory.MaximumLevel) {
                throw { 
                    status: 400, 
                    message: `Exceeds maximum storage level of ${inventory.MaximumLevel}` 
                };
            }
        } else {
            newQuantity = previousQuantity - Number(quantity);
            
            // Validate sufficient quantity
            if (newQuantity < 0) {
                throw { 
                    status: 400, 
                    message: 'Insufficient quantity available' 
                };
            }
        }

        // Update inventory
        await inventory.update({
            CurrentQuantity: newQuantity,
            LastUpdated: new Date(),
            Status: this.calculateInventoryStatus(newQuantity, inventory.MinimumLevel)
        }, { transaction });

        // Record movement
        const movementId = await generateMovementId();
        await InventoryMovement.create({
            MovementID: movementId,
            InventoryID: inventoryId,
            MovementType: movementType,
            Quantity: quantity,
            ReferenceType: referenceData.type,
            ReferenceID: referenceData.id,
            PreviousQuantity: previousQuantity,
            NewQuantity: newQuantity,
            BatchNumber: referenceData.batchNumber,
            Remarks: referenceData.remarks,
            CreatedBy: userId
        }, { transaction });

        await transaction.commit();
        return inventory;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}; */

/*exports.updateInventory = async (inventoryId, quantity, movementType, referenceData, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const inventory = await StoreInventory.findByPk(inventoryId, { transaction });
        if (!inventory) {
            throw { status: 404, message: 'Inventory not found' };
        }

        const previousQuantity = Number(inventory.CurrentQuantity);
        let newQuantity;

        if (movementType === 'IN') {
            newQuantity = previousQuantity + Number(quantity);
            if (newQuantity > inventory.MaximumLevel) {
                throw { 
                    status: 400, 
                    message: `Exceeds maximum storage level of ${inventory.MaximumLevel}` 
                };
            }
        } else {
            newQuantity = previousQuantity - Number(quantity);
            if (newQuantity < 0) {
                throw { 
                    status: 400, 
                    message: 'Insufficient quantity available' 
                };
            }
        }

        // Update inventory
        await inventory.update({
            CurrentQuantity: newQuantity,
            LastUpdated: new Date(),
            Status: this.calculateInventoryStatus(newQuantity, inventory.MinimumLevel)
        }, { transaction });

        // Record movement
        const movementId = await generateMovementId();
        await InventoryMovement.create({
            MovementID: movementId,
            InventoryID: inventoryId,
            MovementType: movementType,
            Quantity: quantity,
            ReferenceType: referenceData.type,
            ReferenceID: referenceData.id,
            PreviousQuantity: previousQuantity,
            NewQuantity: newQuantity,
            BatchNumber: referenceData.batchNumber,
            Remarks: referenceData.remarks,
            CreatedBy: userId
        }, { transaction });

        // Check for low stock and trigger notification if needed
        /*if (newQuantity <= inventory.MinimumLevel) {
            await notificationTriggers.handleLowStockTrigger(
                inventory.StoreID, 
                [{
                    ExplosiveType: await inventory.getExplosiveType(),
                    CurrentQuantity: newQuantity,
                    MinimumLevel: inventory.MinimumLevel
                }]
            );
        }*/
            /*
            if (newQuantity <= inventory.MinimumLevel) {
                const store = await ExplosiveStore.findByPk(inventory.StoreID);
                await notificationService.sendLowStockAlert(
                    inventory.StoreID,
                    [{
                        explosiveType: await inventory.getExplosiveType(),
                        currentQuantity: newQuantity,
                        minimumLevel: inventory.MinimumLevel,
                        critical: newQuantity === 0,
                        storeName: store.StoreName
                    }]
                );
            }*



        await transaction.commit();
        return inventory;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};*/


/*
// Modified updateInventory function in store-inventory.service.js
exports.updateInventory = async (inventoryId, quantity, movementType, referenceData, userId, transaction) => {
    try {
        const inventory = await StoreInventory.findByPk(inventoryId, { transaction });
        if (!inventory) {
            throw { status: 404, message: 'Inventory not found' };
        }

        const previousQuantity = Number(inventory.CurrentQuantity);
        let newQuantity;

        if (movementType === 'IN') {
            newQuantity = previousQuantity + Number(quantity);
            if (newQuantity > inventory.MaximumLevel) {
                throw { 
                    status: 400, 
                    message: `Exceeds maximum storage level of ${inventory.MaximumLevel}` 
                };
            }
        } else {
            newQuantity = previousQuantity - Number(quantity);
            if (newQuantity < 0) {
                throw { 
                    status: 400, 
                    message: 'Insufficient quantity available' 
                };
            }
        }

        // Update inventory
        await inventory.update({
            CurrentQuantity: newQuantity,
            LastUpdated: new Date(),
            Status: this.calculateInventoryStatus(newQuantity, inventory.MinimumLevel)
        }, { transaction });

        // Generate movement ID for this specific movement
        const [movementId] = await generateBulkMovementIds(1);

        // Record movement
        await InventoryMovement.create({
            MovementID: movementId,
            InventoryID: inventoryId,
            MovementType: movementType,
            Quantity: quantity,
            ReferenceType: referenceData.type,
            ReferenceID: referenceData.id,
            PreviousQuantity: previousQuantity,
            NewQuantity: newQuantity,
            BatchNumber: referenceData.batchNumber,
            Remarks: referenceData.remarks,
            CreatedBy: userId
        }, { transaction });

        return inventory;
    } catch (error) {
        throw error;
    }
};*/


exports.updateInventory = async (inventoryId, quantity, movementType, referenceData, userId, transaction) => {
    try {
        const inventory = await StoreInventory.findByPk(inventoryId, { transaction });
        if (!inventory) {
            throw { status: 404, message: 'Inventory not found' };
        }

        const previousQuantity = Number(inventory.CurrentQuantity);
        let newQuantity;

        if (movementType === 'IN') {
            newQuantity = previousQuantity + Number(quantity);
            if (newQuantity > inventory.MaximumLevel) {
                throw { 
                    status: 400, 
                    message: `Exceeds maximum storage level of ${inventory.MaximumLevel}` 
                };
            }
        } else {
            newQuantity = previousQuantity - Number(quantity);
            if (newQuantity < 0) {
                throw { 
                    status: 400, 
                    message: 'Insufficient quantity available' 
                };
            }
        }

        // Update inventory
        await inventory.update({
            CurrentQuantity: newQuantity,
            LastUpdated: new Date(),
            Status: this.calculateInventoryStatus(newQuantity, inventory.MinimumLevel)
        }, { transaction });

        // Generate movement ID within the same transaction
        const movementId = await generateMovementId(transaction);

        // Create movement record in the same transaction
        await InventoryMovement.create({
            MovementID: movementId,
            InventoryID: inventoryId,
            MovementType: movementType,
            Quantity: quantity,
            ReferenceType: referenceData.type,
            ReferenceID: referenceData.id,
            PreviousQuantity: previousQuantity,
            NewQuantity: newQuantity,
            BatchNumber: referenceData.batchNumber,
            Remarks: referenceData.remarks,
            CreatedBy: userId
        }, { transaction });

        return inventory;
    } catch (error) {
        throw error;
    }
};







exports.getInventoryDetails = async (inventoryId) => {
    try {
        return await StoreInventory.findOne({
            where: { InventoryID: inventoryId },
            include: [
                { model: ExplosiveStore },
                { model: ExplosiveType }
            ]
        });
    } catch (error) {
        throw error;
    }
};

exports.getStoreInventory = async (storeId) => {
    try {
        return await StoreInventory.findAll({
            where: { StoreID: storeId },
            include: [{ model: ExplosiveType }]
        });
    } catch (error) {
        throw error;
    }
};

exports.getInventoryMovements = async (inventoryId, filters = {}) => {
    try {
        const { startDate, endDate, movementType, referenceType } = filters;
        
        const whereClause = { InventoryID: inventoryId };
        
        if (startDate && endDate) {
            whereClause.CreatedAt = {
                [Op.between]: [startDate, endDate]
            };
        }
        
        if (movementType) whereClause.MovementType = movementType;
        if (referenceType) whereClause.ReferenceType = referenceType;

        return await InventoryMovement.findAll({
            where: whereClause,
            order: [['CreatedAt', 'DESC']]
        });
    } catch (error) {
        throw error;
    }
};

/*exports.checkLowStock = async () => {
    try {
        return await StoreInventory.findAll({
            where: {
                CurrentQuantity: {
                    [Op.lte]: sequelize.col('MinimumLevel')
                },
                Status: 'Active'
            },
            include: [
                { model: ExplosiveStore },
                { model: ExplosiveType }
            ]
        });
    } catch (error) {
        throw error;
    }
};*/
/*
exports.checkLowStock = async () => {
    try {
        const lowStockItems = await StoreInventory.findAll({
            where: {
                CurrentQuantity: {
                    [Op.lte]: sequelize.col('MinimumLevel')
                },
                Status: 'Active'
            },
            include: [
                { model: ExplosiveStore },
                { model: ExplosiveType }
            ]
        });

        // Group low stock items by store
        /*const storeGroups = lowStockItems.reduce((acc, item) => {
            if (!acc[item.StoreID]) {
                acc[item.StoreID] = [];
            }
            acc[item.StoreID].push(item);
            return acc;
        }, {});

        // Trigger notifications for each store
        for (const [storeId, items] of Object.entries(storeGroups)) {
            await notificationTriggers.handleLowStockTrigger(storeId, items);
        }

            const storeGroups = lowStockItems.reduce((acc, item) => {
                if (!acc[item.StoreID]) {
                    acc[item.StoreID] = [];
                }
                acc[item.StoreID].push({
                    explosiveType: item.ExplosiveType.TypeName,
                    currentQuantity: item.CurrentQuantity,
                    minimumLevel: item.MinimumLevel,
                    critical: item.CurrentQuantity === 0,
                    storeName: item.ExplosiveStore.StoreName
                });
                return acc;
            }, {});
    
            // Send notifications for each store
            for (const [storeId, items] of Object.entries(storeGroups)) {
                await notificationService.sendLowStockAlert(storeId, items);
            }

        return lowStockItems;
    } catch (error) {
        throw error;
    }
};*/

exports.checkLowStock = async () => {
    try {
        const lowStockItems = await StoreInventory.findAll({
            where: {
                CurrentQuantity: {
                    [Op.lte]: sequelize.col('MinimumLevel')
                },
                Status: 'Active'
            },
            include: [
                { model: ExplosiveStore },
                { model: ExplosiveType }
            ]
        });

        // Group by store and send notifications
        const storeGroups = lowStockItems.reduce((acc, item) => {
            if (!acc[item.StoreID]) {
                acc[item.StoreID] = [];
            }
            acc[item.StoreID].push({
                explosiveType: item.ExplosiveType.TypeName,
                currentQuantity: item.CurrentQuantity,
                minimumLevel: item.MinimumLevel,
                critical: item.CurrentQuantity === 0
            });
            return acc;
        }, {});

        // Send notification for each store
        for (const [storeId, items] of Object.entries(storeGroups)) {
            await notificationService.sendLowStockAlert(storeId, items);
        }

        return lowStockItems;
    } catch (error) {
        throw error;
    }
};

exports.calculateInventoryStatus = (currentQuantity, minimumLevel) => {
    if (currentQuantity === 0) return 'OutOfStock';
    if (currentQuantity <= minimumLevel) return 'LowStock';
    return 'Active';
};

exports.validateInventoryOperation = async (inventoryId, quantity, operationType) => {
    const inventory = await StoreInventory.findByPk(inventoryId);
    if (!inventory) {
        throw { status: 404, message: 'Inventory not found' };
    }

    if (operationType === 'OUT' && quantity > inventory.CurrentQuantity) {
        throw { 
            status: 400, 
            message: 'Insufficient quantity',
            available: inventory.CurrentQuantity
        };
    }

    if (operationType === 'IN' && 
        (inventory.CurrentQuantity + quantity) > inventory.MaximumLevel) {
        throw { 
            status: 400, 
            message: 'Exceeds maximum capacity',
            remaining: inventory.MaximumLevel - inventory.CurrentQuantity
        };
    }

    return true;
};

// Add to store-inventory.service.js

exports.generateInventoryReport = async (storeId, reportType = 'detailed') => {
    try {
        const inventory = await StoreInventory.findAll({
            where: { StoreID: storeId },
            include: [
                { model: ExplosiveType },
                { 
                    model: InventoryMovement,
                    limit: 10,
                    order: [['CreatedAt', 'DESC']]
                }
            ]
        });

        const store = await ExplosiveStore.findByPk(storeId);

        const report = {
            reportDate: new Date(),
            storeName: store.StoreName,
            storeId: storeId,
            summary: {
                totalItems: inventory.length,
                totalValue: inventory.reduce((sum, item) => 
                    sum + Number(item.CurrentQuantity), 0),
                lowStockItems: inventory.filter(item => 
                    item.Status === 'LowStock').length
            },
            inventory: inventory.map(item => ({
                explosiveType: item.ExplosiveType.TypeName,
                currentQuantity: item.CurrentQuantity,
                minimumLevel: item.MinimumLevel,
                maximumLevel: item.MaximumLevel,
                status: item.Status,
                lastUpdated: item.LastUpdated,
                recentMovements: item.InventoryMovements
            }))
        };

        if (reportType === 'summary') {
            delete report.inventory;
        }

        return report;
    } catch (error) {
        throw error;
    }
};