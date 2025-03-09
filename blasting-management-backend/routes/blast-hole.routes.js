// routes/blast-hole.routes.js
/*const router = require('express').Router();
const blastHoleController = require('../controllers/blast-hole.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/blast-holes/batch
 * @desc    Create multiple blast holes for a blast event
 * @access  Private - Admin, Site Engineer
 
router.post('/batch',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.createBlastHoles
);

/**
 * @route   GET /api/blast-holes/blast/:blast_id
 * @desc    Get all blast holes for a blast event
 * @access  Private - Admin, Site Engineer
 
router.get('/blast/:blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.getBlastHoles
);

/**
 * @route   PUT /api/blast-holes/:blast_hole_id
 * @desc    Update blast hole details
 * @access  Private - Admin, Site Engineer
 
router.put('/:blast_hole_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.updateBlastHole
);

/**
 * @route   GET /api/blast-holes/:blast_hole_id/details
 * @desc    Get blast hole details including explosives
 * @access  Private - Admin, Site Engineer
 
router.get('/:blast_hole_id/details',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.getBlastHoleDetails
);

/**
 * @route   PUT /api/blast-holes/blast/:blast_id/batch-status
 * @desc    Update multiple blast holes status
 * @access  Private - Admin, Site Engineer
 
router.put('/blast/:blast_id/batch-status',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.updateBatchStatus
);

/**
 * @route   POST /api/blast-holes/:blast_hole_id/misfire
 * @desc    Mark blast hole as misfired
 * @access  Private - Admin, Site Engineer
 
router.post('/:blast_hole_id/misfire',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.markMisfired
);

/**
 * @route   GET /api/blast-holes/blast/:blast_id/charging-sequence
 * @desc    Get recommended charging sequence
 * @access  Private - Admin, Site Engineer
 
router.get('/blast/:blast_id/charging-sequence',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.getChargingSequence
);

/**
 * @route   GET /api/blast-holes/blast/:blast_id/explosive-distribution
 * @desc    Get explosive distribution summary
 * @access  Private - Admin, Site Engineer
 
router.get('/blast/:blast_id/explosive-distribution',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastHoleController.getExplosiveDistribution
);

module.exports = router;*/

// routes/blast-hole.routes.js
const router = require('express').Router();
const blastHoleController = require('../controllers/blast-hole.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/blast-hole/batch
 * @desc    Create multiple blast holes with explosive usage in batch
 * @access  Private - Site Engineer
 */
router.post('/batch',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), 
    //verifyMiningSiteAccess
],
    blastHoleController.createBatchHoles
);

/**
 * @route   GET /api/blast-hole/blast/:blast_id
 * @desc    Get all holes for a blast event
 * @access  Private - Site Engineer
 */
router.get('/blast/:blast_id',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), 
    //verifyMiningSiteAccess
],
    blastHoleController.getBlastHoles
);

/**
 * @route   PUT /api/blast-hole/:hole_id/status
 * @desc    Update hole status (CHARGED, FIRED, MISFIRED)
 * @access  Private - Site Engineer
 */
router.put('/:hole_id/status',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), 
    //verifyMiningSiteAccess
],
    blastHoleController.updateHoleStatus
);

/**
 * @route   PUT /api/blast-hole/:hole_id/explosives
 * @desc    Update explosive quantities for a hole
 * @access  Private - Site Engineer
 */
router.put('/:hole_id/explosives',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    blastHoleController.updateHoleExplosives
);

/**
 * @route   GET /api/blast-hole/:hole_id/details
 * @desc    Get detailed hole information including explosives
 * @access  Private - Site Engineer
 */
router.get('/:hole_id/details',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    blastHoleController.getHoleDetails
);

module.exports = router;