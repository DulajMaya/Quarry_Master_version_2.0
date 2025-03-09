const router = require('express').Router();
const explosiveControllerController = require('../controllers/explosive-controller.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyDistrictAccess } = require('../middleware/access-control.middleware');

// Create new explosive controller (Admin only)
router.post('/',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveControllerController.createExplosiveController
);

// Get all explosive controllers (with filters and pagination)
router.get('/',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveControllerController.getAllExplosiveControllers
);

// Get controllers by district
router.get('/district/:district',
    [verifyToken],
    explosiveControllerController.getControllersByDistrict
);

// Get specific explosive controller
router.get('/:controllerId',
    [verifyToken, hasRole([ROLES.ADMIN])],
    explosiveControllerController.getExplosiveController
);

// Update explosive controller
router.put('/:controllerId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveControllerController.updateExplosiveController
);

// Change controller status
router.patch('/:controllerId/status',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveControllerController.changeControllerStatus
);

// Delete explosive controller
router.delete('/:controllerId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveControllerController.deleteExplosiveController
);

module.exports = router;