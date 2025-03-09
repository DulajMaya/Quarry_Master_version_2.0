// routes/daily-blast-operation.routes.js
/*const router = require('express').Router();
const dailyBlastOperationController = require('../controllers/daily-blast-operation.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/daily-blast-operations
 * @desc    Create a new daily blast operation
 * @access  Private - Admin, Site Engineer
 
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.createDailyOperation
);

/**
 * @route   GET /api/daily-blast-operations/site/:miningSiteId
 * @desc    Get all daily operations for a mining site
 * @access  Private - Admin, Site Engineer
 
router.get('/site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.getDailyOperations
);

/**
 * @route   GET /api/daily-blast-operations/:daily_blast_id
 * @desc    Get daily operation details
 * @access  Private - Admin, Site Engineer
 
router.get('/:daily_blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.getDailyOperationDetails
);

/**
 * @route   PUT /api/daily-blast-operations/:daily_blast_id
 * @desc    Update daily operation
 * @access  Private - Admin, Site Engineer
 
router.put('/:daily_blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.updateDailyOperation
);

/**
 * @route   GET /api/daily-blast-operations/:daily_blast_id/summary
 * @desc    Get daily operation summary including explosives used
 * @access  Private - Admin, Site Engineer
 
router.get('/:daily_blast_id/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.getDailySummary
);

/**
 * @route   PUT /api/daily-blast-operations/:daily_blast_id/complete
 * @desc    Mark daily operation as completed
 * @access  Private - Admin, Site Engineer
 
router.put('/:daily_blast_id/complete',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.completeDailyOperation
);

/**
 * @route   GET /api/daily-blast-operations/site/:miningSiteId/report
 * @desc    Get blasting report for date range
 * @access  Private - Admin, Site Engineer
 
router.get('/site/:miningSiteId/report',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.getBlastingReport
);

/**
 * @route   GET /api/daily-blast-operations/:daily_blast_id/explosive-usage
 * @desc    Get explosive usage details for a daily operation
 * @access  Private - Admin, Site Engineer
 
router.get('/:daily_blast_id/explosive-usage',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    dailyBlastOperationController.getExplosiveUsage
);

module.exports = router;*/

// routes/daily-blast-operation.routes.js
const router = require('express').Router();
const dailyBlastController = require('../controllers/daily-blast-operation.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/daily-blast
 * @desc    Create new daily blast operation
 * @access  Private - Site Engineer
 */
router.post('/',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.createDailyBlast
);

/**
 * @route   GET /api/daily-blast/site/:miningSiteId
 * @desc    Get all daily blast operations for a mining site
 * @access  Private - Site Engineer
 */
router.get('/site/:miningSiteId',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.getDailyBlasts
);

/**
 * @route   GET /api/daily-blast/:daily_blast_id
 * @desc    Get specific daily blast operation details
 * @access  Private - Site Engineer
 */
router.get('/:daily_blast_id',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.getDailyBlastDetails
);

/**
 * @route   GET /api/daily-blast/:daily_blast_id/explosive-balance
 * @desc    Get explosive balance for daily operation
 * @access  Private - Site Engineer
 */
router.get('/:daily_blast_id/explosive-balance',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.getExplosiveBalance
);

/**
 * @route   PUT /api/daily-blast/:daily_blast_id/status
 * @desc    Update daily blast operation status
 * @access  Private - Site Engineer
 */
router.put('/:daily_blast_id/status',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.updateStatus
);

/**
 * @route   POST /api/daily-blast/:daily_blast_id/complete
 * @desc    Complete daily blast operation with final reconciliation
 * @access  Private - Site Engineer
 */
router.post('/:daily_blast_id/complete',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.completeDailyBlast
);

/**
 * @route   GET /api/daily-blast/:daily_blast_id/summary
 * @desc    Get daily blast operation summary with all blasts and explosive usage
 * @access  Private - Site Engineer
 */
router.get('/:daily_blast_id/summary',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    dailyBlastController.getDailySummary
);

module.exports = router;