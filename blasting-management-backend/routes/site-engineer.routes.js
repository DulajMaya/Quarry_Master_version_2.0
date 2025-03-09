const router = require('express').Router();
const siteEngineerController = require('../controllers/site-engineer.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMininingSiteAccess } = require('../middleware/access-control.middleware');

// Create new site engineer (Admin only)
router.post('/',
    [verifyToken, hasRole(ROLES.ADMIN)],
    siteEngineerController.createSiteEngineer
);

// Get all site engineers (with filters and pagination)
router.get('/',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])],
    siteEngineerController.getAllSiteEngineers
);

// Get specific site engineer
router.get('/:engineerId',
    [verifyToken, hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])],
    siteEngineerController.getSiteEngineer
);

// Update site engineer
router.put('/:engineerId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    siteEngineerController.updateSiteEngineer
);

// Change site engineer status
router.patch('/:engineerId/status',
    [verifyToken, hasRole(ROLES.ADMIN)],
    siteEngineerController.changeSiteEngineerStatus
);

// Delete site engineer
router.delete('/:engineerId',
    [verifyToken, hasRole(ROLES.ADMIN)],
    siteEngineerController.deleteSiteEngineer
);

module.exports = router;