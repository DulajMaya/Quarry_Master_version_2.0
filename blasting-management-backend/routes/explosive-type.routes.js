const router = require('express').Router();
const explosiveTypeController = require('../controllers/explosive-type.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');

// Create new explosive type (Admin only)
router.post('/',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveTypeController.createExplosiveType
);

// Get all explosive types (with filters and pagination)
router.get('/',
    [verifyToken],
    explosiveTypeController.getAllExplosiveTypes
);

// Get specific explosive type
router.get('/:explosiveTypeId',
    [verifyToken],
    explosiveTypeController.getExplosiveType
);

// Update explosive type
router.put('/:explosiveTypeId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveTypeController.updateExplosiveType
);

// Change explosive type status
router.patch('/:explosiveTypeId/status',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveTypeController.changeExplosiveTypeStatus
);

module.exports = router;