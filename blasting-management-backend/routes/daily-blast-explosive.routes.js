// routes/daily-blast-explosive.routes.js
/*const router = require('express').Router();
const dailyBlastExplosiveController = require('../controllers/daily-blast-explosive.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');
const { verifyStoreAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/daily-blast-explosives
 * @desc    Create explosive allocation for daily blast operation
 * @access  Private - Admin, Site Engineer
 
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess,
        verifyStoreAccess
    ],
    dailyBlastExplosiveController.createExplosiveAllocation
);

/**
 * @route   GET /api/daily-blast-explosives/daily/:daily_blast_id
 * @desc    Get all explosive allocations for a daily blast operation
 * @access  Private - Admin, Site Engineer
 
router.get('/daily/:daily_blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastExplosiveController.getDailyExplosives
);

/**
 * @route   PUT /api/daily-blast-explosives/:daily_blast_explosive_id
 * @desc    Update explosive usage details
 * @access  Private - Admin, Site Engineer
 
router.put('/:daily_blast_explosive_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess,
        verifyStoreAccess
    ],
    dailyBlastExplosiveController.updateExplosiveUsage
);

/**
 * @route   GET /api/daily-blast-explosives/daily/:daily_blast_id/summary
 * @desc    Get explosive usage summary for a daily operation
 * @access  Private - Admin, Site Engineer
 
router.get('/daily/:daily_blast_id/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastExplosiveController.getDailyExplosiveSummary
);

/**
 * @route   POST /api/daily-blast-explosives/:daily_blast_explosive_id/return
 * @desc    Record explosive returns
 * @access  Private - Admin, Site Engineer
 
router.post('/:daily_blast_explosive_id/return',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess,
        verifyStoreAccess
    ],
    dailyBlastExplosiveController.recordExplosiveReturn
);

/**
 * @route   GET /api/daily-blast-explosives/store/:storeId/usage
 * @desc    Get explosive usage report for a store
 * @access  Private - Admin, Site Engineer
 
router.get('/store/:storeId/usage',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    dailyBlastExplosiveController.getStoreUsageReport
);

module.exports = router;*/