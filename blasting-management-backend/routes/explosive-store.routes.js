const router = require('express').Router();
const explosiveStoreController = require('../controllers/explosive-store.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyStoreAccess , verifyMiningSiteAccess } = require('../middleware/access-control.middleware');
const explosiveStoreService = require('../services/explosive-store.service')

// Create new store (Admin only)
router.post('/',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveStoreController.createExplosiveStore
);
router.get('/sites/:miningSiteId/store', [verifyToken, verifyMiningSiteAccess], explosiveStoreController.getSiteStore );

// Get all stores
router.get('/',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])],
    explosiveStoreController.getAllExplosiveStores
);


// Get specific store
router.get('/:storeId',
    [verifyToken, verifyStoreAccess],
    explosiveStoreController.getExplosiveStore
);

// Get store summary
router.get('/:storeId/summary',
    [verifyToken, verifyStoreAccess],
    explosiveStoreController.getStoreSummary
);



// Update store
router.put('/:storeId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveStoreController.updateExplosiveStore
);

// Change store status
router.patch('/:storeId/status',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveStoreController.changeStoreStatus
);

// Add to existing routes

// Get store capacity utilization
router.get('/:storeId/capacity',
    [verifyToken, verifyStoreAccess],
    async (req, res) => {
        try {
            const utilization = await explosiveStoreService
                .getStoreCapacityUtilization(req.params.storeId);

            res.json({
                status: 'success',
                data: utilization
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

// Validate capacity for planned purchase/transfer
router.post('/:storeId/validate-capacity',
    [verifyToken, verifyStoreAccess],
    async (req, res) => {
        try {
            await explosiveStoreService.validateStoreCapacity(
                req.params.storeId,
                req.body.plannedQuantity
            );

            res.json({
                status: 'success',
                message: 'Capacity available'
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message,
                details: error.details
            });
        }
    }
);

// Get expiring licenses
router.get('/expiring-licenses',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])],
    async (req, res) => {
        try {
            const expiringStores = await explosiveStoreService.checkStoreLicenseStatus();

            res.json({
                status: 'success',
                data: expiringStores
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            });
        }
    }
);

module.exports = router;