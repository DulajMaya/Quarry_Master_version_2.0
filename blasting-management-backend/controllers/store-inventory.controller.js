const storeInventoryService = require('../services/store-inventory.service');
const { StoreInventory, InventoryMovement, ExplosiveStore, ExplosiveType,User } = require('../models');

exports.initializeInventory = async (req, res) => {
    try {
        const inventory = await storeInventoryService.initializeInventory(
            req.body.storeId,
            req.body.explosiveTypeId,
            {
                minimumLevel: req.body.minimumLevel,
                maximumLevel: req.body.maximumLevel
            }
        );

        res.status(201).json({
            status: 'success',
            message: 'Inventory initialized successfully',
            data: inventory
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error initializing inventory'
        });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const inventory = await storeInventoryService.updateInventory(
            req.params.inventoryId,
            req.body.quantity,
            req.body.movementType,
            {
                type: req.body.referenceType,
                id: req.body.referenceId,
                batchNumber: req.body.batchNumber,
                remarks: req.body.remarks
            },
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Inventory updated successfully',
            data: inventory
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating inventory'
        });
    }
};

exports.getInventoryDetails = async (req, res) => {
    try {
        const inventory = await storeInventoryService.getInventoryDetails(req.params.inventoryId);
        
        if (!inventory) {
            return res.status(404).json({
                status: 'error',
                message: 'Inventory not found'
            });
        }

        res.json({
            status: 'success',
            data: inventory
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving inventory details'
        });
    }
};

exports.getStoreInventory = async (req, res) => {
    try {
        const inventory = await storeInventoryService.getStoreInventory(req.params.storeId);

        res.json({
            status: 'success',
            data: inventory
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving store inventory'
        });
    }
};

exports.getInventoryMovements = async (req, res) => {
    try {
        const movements = await storeInventoryService.getInventoryMovements(
            req.params.inventoryId,
            {
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                movementType: req.query.movementType,
                referenceType: req.query.referenceType
            }
        );

        res.json({
            status: 'success',
            data: movements
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving inventory movements'
        });
    }
};

exports.checkLowStock = async (req, res) => {
    try {
        const lowStockItems = await storeInventoryService.checkLowStock();

        res.json({
            status: 'success',
            data: lowStockItems
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error checking low stock'
        });
    }
};

exports.validateInventoryOperation = async (req, res) => {
    try {
        await storeInventoryService.validateInventoryOperation(
            req.params.inventoryId,
            req.body.quantity,
            req.body.operationType
        );

        res.json({
            status: 'success',
            message: 'Operation is valid'
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message,
            details: error.details
        });
    }
};

// Add to store-inventory.controller.js

exports.getInventoryHistory = async (req, res) => {
    try {
        const history = await InventoryMovement.findAll({
            where: { InventoryID: req.params.inventoryId },
            include: [
                {
                    model: User,
                    as: 'Creator',
                    attributes: ['username','reference_type']
                }
            ],
            order: [['CreatedAt', 'DESC']]
        });

        const inventory = await StoreInventory.findByPk(req.params.inventoryId, {
            include: [{ model: ExplosiveType }]
        });

        res.json({
            status: 'success',
            data: {
                inventory: {
                    type: inventory.ExplosiveType.TypeName,
                    currentQuantity: inventory.CurrentQuantity,
                    status: inventory.Status
                },
                movements: history
            }
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving inventory history'
        });
    }
};