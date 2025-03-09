const router = require('express').Router();
const storeInventoryController = require('../controllers/store-inventory.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyStoreAccess, verifyInventoryAccess } = require('../middleware/access-control.middleware');

// Initialize inventory for explosive type in store
router.post('/initialize',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])],
    storeInventoryController.initializeInventory
);

router.post('/test-stock-alert', verifyToken, async (req, res) => {
    try {
        const notificationService = require('../notifications/services/notification.service');
        await notificationService.sendLowStockAlert(
            'STORE001', // storeId
            [
                {
                    explosiveTypeId: 'EXP001',
                    currentQuantity: 5,
                    thresholdQuantity: 10
                }
            ],
            req.userId
        );
        res.json({ success: true, message: 'Stock alert sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update inventory
router.put('/:inventoryId',
    [verifyToken, verifyInventoryAccess],
    storeInventoryController.updateInventory
);

// Get all inventory for a store
router.get('/store/:storeId',
    [verifyToken, verifyStoreAccess],
    storeInventoryController.getStoreInventory
);

// Get inventory details
/*router.get('/:inventoryId',
    [verifyToken, verifyStoreAccess],
    storeInventoryController.getInventoryDetails
);*/

router.get('/:inventoryId',
    [verifyToken, verifyInventoryAccess],
    storeInventoryController.getInventoryDetails
);



// Get inventory movements
router.get('/:inventoryId/movements',
    [verifyToken, verifyInventoryAccess],
    storeInventoryController.getInventoryMovements
);

// Check low stock items
router.get('/low-stock',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])],
    storeInventoryController.checkLowStock
);


// Check low stock items
router.get('/low-stock',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])],
    storeInventoryController.checkLowStock
);

// Validate inventory operation
router.post('/:inventoryId/validate',
    [verifyToken, verifyInventoryAccess],
    storeInventoryController.validateInventoryOperation
);

/* no controller created
// Generate inventory report
router.get('/store/:storeId/report',
    [verifyToken, verifyStoreAccess],
    storeInventoryController.generateInventoryReport
);*/

// Get inventory history
router.get('/:inventoryId/history',
    [verifyToken, verifyInventoryAccess],
    storeInventoryController.getInventoryHistory
);

module.exports = router;