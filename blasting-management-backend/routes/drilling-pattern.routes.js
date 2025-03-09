// routes/drilling-pattern.routes.js
const router = require('express').Router();
const drillingPatternController = require('../controllers/drilling-pattern.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess, verifyDrillingSiteAccess } = require('../middleware/access-control.middleware');
const { patternDiagramUpload } = require('../middleware/upload.middleware');

/**
 * @route   POST /api/drilling-patterns
 * @desc    Create a new drilling pattern
 * @access  Private - Admin, Site Engineer
 */
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyDrillingSiteAccess
    ],
    drillingPatternController.createPattern
);

/**
 * @route   GET /api/drilling-patterns/site/:drilling_site_id
 * @desc    Get all patterns for a drilling site with pagination and filters
 * @access  Private - Admin, Site Engineer
 */
router.get('/site/:drilling_site_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyDrillingSiteAccess
    ],
    drillingPatternController.getPatterns
);

/**
 * @route   GET /api/drilling-patterns/:pattern_id
 * @desc    Get pattern by ID
 * @access  Private - Admin, Site Engineer
 */
router.get('/:pattern_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess
    ],
    drillingPatternController.getPatternById
);

/**
 * @route   PUT /api/drilling-patterns/:pattern_id
 * @desc    Update drilling pattern
 * @access  Private - Admin, Site Engineer
 */
router.put('/:pattern_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess
    ],
    drillingPatternController.updatePattern
);

/**
 * @route   DELETE /api/drilling-patterns/:pattern_id
 * @desc    Delete (soft) drilling pattern
 * @access  Private - Admin
 */
router.delete('/:pattern_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN]),
        //verifyMiningSiteAccess
    ],
    drillingPatternController.deletePattern
);

/**
 * @route   POST /api/drilling-patterns/validate
 * @desc    Validate pattern against license parameters
 * @access  Private - Admin, Site Engineer
 
router.post('/validate',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])
    ],
    drillingPatternController.validatePattern
);*/

/**
 * @route   GET /api/drilling-patterns/:pattern_id/summary
 * @desc    Get pattern summary including hole statistics
 * @access  Private - Admin, Site Engineer
 
router.get('/:pattern_id/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    drillingPatternController.getPatternSummary
);*/

/**
 * @route   POST /api/drilling-patterns/:pattern_id/diagram
 * @desc    Upload pattern diagram
 * @access  Private - Admin, Site Engineer
 */
router.post('/:pattern_id/diagram',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess,
        patternDiagramUpload.single('diagram')
    ],
    drillingPatternController.uploadPatternDiagram
);

module.exports = router;