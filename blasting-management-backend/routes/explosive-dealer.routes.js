const router = require('express').Router();
const explosiveDealerController = require('../controllers/explosive-dealer.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyDistrictAccess } = require('../middleware/access-control.middleware');

// Create new explosive dealer (Admin only)
router.post('/',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveDealerController.createExplosiveDealer
);

// Get all explosive dealers (with filters and pagination)
router.get('/',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])],
    explosiveDealerController.getAllExplosiveDealers
);

// Get dealers by district
router.get('/district/:district',
    [verifyToken],
    explosiveDealerController.getDealersByDistrict
);

// Get specific explosive dealer
router.get('/:dealerId',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])],
    explosiveDealerController.getExplosiveDealer
);

// Get dealer summary
router.get('/:dealerId/summary',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_DEALER])],
    explosiveDealerController.getDealerSummary
);

// Update explosive dealer
router.put('/:dealerId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveDealerController.updateExplosiveDealer
);

// Change dealer status
router.patch('/:dealerId/status',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveDealerController.changeDealerStatus
);

// Delete explosive dealer
router.delete('/:dealerId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    explosiveDealerController.deleteExplosiveDealer
);

/* no controller created
// Get dealer purchases (for the dealer's own view)
router.get('/:dealerId/purchases',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_DEALER])],
    explosiveDealerController.getDealerPurchases
);

// Get dealer license status
router.get('/:dealerId/license',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_DEALER, ROLES.EXPLOSIVE_CONTROLLER])],
    explosiveDealerController.getDealerLicense
);*/

module.exports = router;