// routes/drilling-site.routes.js
const router = require('express').Router();
const drillingSiteController = require('../controllers/drilling-site.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/drilling-sites
 * @desc    Create a new drilling site
 * @access  Private - Admin, Site Engineer
 */
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    drillingSiteController.createDrillingSite
);

/**
 * @route   GET /api/drilling-sites/mining-site/:miningSiteId
 * @desc    Get all drilling sites for a mining site with pagination and filters
 * @access  Private - Admin, Site Engineer
 */
router.get('/mining-site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    drillingSiteController.getDrillingSites
);

/**
 * @route   GET /api/drilling-sites/:drilling_site_id
 * @desc    Get drilling site by ID
 * @access  Private - Admin, Site Engineer
 */
router.get('/:drilling_site_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess
    ],
    drillingSiteController.getDrillingSiteById
);

/**
 * @route   PUT /api/drilling-sites/:drilling_site_id
 * @desc    Update drilling site
 * @access  Private - Admin, Site Engineer
 */
router.put('/:drilling_site_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    drillingSiteController.updateDrillingSite
);

/**
 * @route   DELETE /api/drilling-sites/:drilling_site_id
 * @desc    Delete (soft) drilling site
 * @access  Private - Admin
 */
router.delete('/:drilling_site_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN]),
        verifyMiningSiteAccess
    ],
    drillingSiteController.deleteDrillingSite
);

module.exports = router;