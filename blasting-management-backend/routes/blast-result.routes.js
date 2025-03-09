// routes/blast-result.routes.js
const router = require('express').Router();
const blastResultController = require('../controllers/blast-result.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * @route   POST /api/blast-results
 * @desc    Create blast result with photos
 * @access  Private - Admin, Site Engineer
 */
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
        //upload.array('photos', 5)  // Allow up to 5 photos
    ],
    blastResultController.createBlastResult
);

/**
 * @route   GET /api/blast-results/blast/:blast_id
 * @desc    Get blast result for a blast event
 * @access  Private - Admin, Site Engineer
 */
router.get('/blast/:blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastResultController.getBlastResult
);

/**
 * @route   PUT /api/blast-results/:result_id
 * @desc    Update blast result
 * @access  Private - Admin, Site Engineer
 */
router.put('/:result_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
        //upload.array('photos', 5)  // Allow additional photos
    ],
    blastResultController.updateBlastResult
);

/**
 * @route   GET /api/blast-results/site/:miningSiteId
 * @desc    Get blast results with filters and pagination
 * @access  Private - Admin, Site Engineer
 */
router.get('/site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastResultController.getBlastResults
);

/**
 * @route   GET /api/blast-results/site/:miningSiteId/summary
 * @desc    Get blast results summary report
 * @access  Private - Admin, Site Engineer
 */
router.get('/site/:miningSiteId/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastResultController.generateSummaryReport
);

/**
 * @route   POST /api/blast-results/:result_id/photos
 * @desc    Add additional photos to blast result
 * @access  Private - Admin, Site Engineer
 
router.post('/:result_id/photos',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess,
        upload.array('photos', 5)
    ],
    blastResultController.addResultPhotos
);

/**
 * @route   DELETE /api/blast-results/:result_id/photos/:photo_id
 * @desc    Remove photo from blast result
 * @access  Private - Admin, Site Engineer
 
router.delete('/:result_id/photos/:photo_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastResultController.removeResultPhoto
);

/**
 * @route   GET /api/blast-results/analysis/:miningSiteId
 * @desc    Get advanced blast analysis report
 * @access  Private - Admin, Site Engineer
 
router.get('/analysis/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastResultController.getAnalysisReport
);*/

module.exports = router;