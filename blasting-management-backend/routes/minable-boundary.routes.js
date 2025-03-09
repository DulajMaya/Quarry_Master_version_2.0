// routes/minable-boundary.routes.js
const router = require('express').Router();
const minableBoundaryController = require('../controllers/minable-boundary.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/boundaries
 * @desc    Create boundary points for a mining site
 * @access  Private - Admin only
 */
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN]),
        verifyMiningSiteAccess
    ],
    minableBoundaryController.createBoundaryPoints
);

/**
 * @route   GET /api/boundaries/site/:siteId
 * @desc    Get all boundary points for a specific mining site
 * @access  Private - Admin, Site Engineer
 */
router.get('/site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    minableBoundaryController.getBoundariesBySiteId
);

/**
 * @route   PUT /api/boundaries/site/:siteId
 * @desc    Update boundary points for a mining site
 * @access  Private - Admin only
 */
router.put('/site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN]),
        verifyMiningSiteAccess
    ],
    minableBoundaryController.updateBoundaryPoints
);

/**
 * @route   DELETE /api/boundaries/site/:siteId
 * @desc    Delete (soft delete) boundary points for a mining site
 * @access  Private - Admin only
 */
router.delete('/site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN]),
        verifyMiningSiteAccess
    ],
    minableBoundaryController.deleteBoundaryPoints
);

/**
 * @route   POST /api/boundaries/validate
 * @desc    Validate boundary points without saving
 * @access  Private - Admin
 */
router.post('/validate',
    [
        verifyToken,
        hasRole([ROLES.ADMIN])
    ],
    minableBoundaryController.validateBoundaryPoints
);

module.exports = router;