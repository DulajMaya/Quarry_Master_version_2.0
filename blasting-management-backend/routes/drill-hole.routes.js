// routes/drill-hole.routes.js
const router = require('express').Router();
const drillHoleController = require('../controllers/drill-hole.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess,verifyPatternAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/drill-holes/batch
 * @desc    Create multiple drill holes for a pattern
 * @access  Private - Admin, Site Engineer
 */
router.post('/batch',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyPatternAccess
    ],
    drillHoleController.createDrillHoles
);

/**
 * @route   GET /api/drill-holes/pattern/:pattern_id
 * @desc    Get all drill holes for a pattern
 * @access  Private - Admin, Site Engineer
 */
router.get('/pattern/:pattern_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyPatternAccess
    ],
    drillHoleController.getDrillHoles
);

/**
 * @route   PUT /api/drill-holes/:hole_id
 * @desc    Update drill hole details
 * @access  Private - Admin, Site Engineer
 */
router.put('/:hole_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyPatternAccess
    ],
    drillHoleController.updateDrillHole
);

/**
 * @route   PUT /api/drill-holes/:hole_id/status
 * @desc    Update drill hole status
 * @access  Private - Admin, Site Engineer
 */
router.put('/:hole_id/status',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        
    ],
    drillHoleController.updateDrillHoleStatus
);

/**
 * @route   PUT /api/drill-holes/pattern/:pattern_id/batch-status
 * @desc    Update multiple drill holes status
 * @access  Private - Admin, Site Engineer
 */
router.put('/pattern/:pattern_id/batch-status',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyPatternAccess
    ],
    drillHoleController.updateBatchStatus
);

/**
 * @route   GET /api/drill-holes/:hole_id/deviations
 * @desc    Get drill hole deviations (actual vs designed)
 * @access  Private - Admin, Site Engineer
 
router.get('/:hole_id/deviations',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    drillHoleController.calculateDeviations
);*/

/**
 * @route   GET /api/drill-holes/pattern/:pattern_id/stats
 * @desc    Get drilling statistics for a pattern
 * @access  Private - Admin, Site Engineer
 
router.get('/pattern/:pattern_id/stats',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    drillHoleController.getPatternStats
);*/

module.exports = router;