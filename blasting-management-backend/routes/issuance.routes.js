// issuance.routes.js
/*
const router = require('express').Router();
const issuanceController = require('../controllers/issuance.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyStoreAccess } = require('../middleware/access-control.middleware');

// Create new issuance
router.post('/',
   [
       verifyToken,
       hasRole([ROLES.SITE_ENGINEER]),
       verifyStoreAccess
   ],
   issuanceController.createIssuance
);

// Record return
router.post('/:issuanceId/return',
   [
       verifyToken,
       hasRole([ROLES.SITE_ENGINEER]),
       verifyStoreAccess
   ],
   issuanceController.recordReturn
);

// Get issuance details
router.get('/:issuanceId',
   [
       verifyToken,
       verifyStoreAccess
   ],
   issuanceController.getIssuanceDetails
);

// Get store issuances
router.get('/store/:storeId',
   [
       verifyToken,
       verifyStoreAccess
   ],
   issuanceController.getStoreIssuances
);

module.exports = router;*/

// routes/explosive-issuance.routes.js
const router = require('express').Router();
const explosiveIssuanceController = require('../controllers/explosive-issuance.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess ,verifyStoreAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/explosive-issuance
 * @desc    Create new explosive issuance for a daily blast operation
 * @access  Private - Admin, Site Engineer
 */
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyStoreAccess lets create new one later
    ],
    explosiveIssuanceController.createIssuance
);

/**
 * @route   GET /api/explosive-issuance/:issuance_id
 * @desc    Get explosive issuance details with all items
 * @access  Private - Admin, Site Engineer
 */
router.get('/:issuance_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess
    ],
    explosiveIssuanceController.getIssuanceDetails
);

/**
 * @route   GET /api/explosive-issuance/daily/:daily_blast_id
 * @desc    Get all issuances for a daily blast operation
 * @access  Private - Admin, Site Engineer
 */
router.get('/daily/:daily_blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess
    ],
    explosiveIssuanceController.getDailyIssuances
);

/**
 * @route   PUT /api/explosive-issuance/:issuance_id/status
 * @desc    Update issuance status (ISSUED, IN_USE, PENDING_RETURN, etc)
 * @access  Private - Admin, Site Engineer
 
router.put('/:issuance_id/status',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    explosiveIssuanceController.updateIssuanceStatus
);*/

/**
 * @route   POST /api/explosive-issuance/:issuance_id/return
 * @desc    Record explosive returns, including damaged/wasted quantities
 * @access  Private - Admin, Site Engineer
 */
/*router.post('/:issuance_id/return',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess
    ],
    explosiveIssuanceController.recordReturn
);*/

/**
 * @route   GET /api/explosive-issuance/:issuance_id/reconcile
 * @desc    Get reconciliation status and details
 * @access  Private - Admin, Site Engineer
 
router.get('/:issuance_id/reconcile',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    explosiveIssuanceController.getReconciliation
);*/

/**
 * @route   GET /api/explosive-issuance/store/:store_id/available
 * @desc    Get available explosives in store for issuance
 * @access  Private - Admin, Site Engineer
 
router.get('/store/:store_id/available',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    explosiveIssuanceController.getAvailableExplosives
);*/

/**
 * @route   PUT /api/explosive-issuance/:issuance_id/items
 * @desc    Update explosive issuance items (quantities, batch numbers)
 * @access  Private - Admin, Site Engineer
 
router.put('/:issuance_id/items',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    explosiveIssuanceController.updateIssuanceItems
);*/

//new issuance routes

router.get('/:issuance_id/usage-status',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])],
    explosiveIssuanceController.getUsageStatus
);

router.get('/:issuance_id/return-preview',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])],
    explosiveIssuanceController.getReturnPreview
);

router.post('/:issuance_id/return',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])],
    explosiveIssuanceController.recordReturn
 );

module.exports = router;
