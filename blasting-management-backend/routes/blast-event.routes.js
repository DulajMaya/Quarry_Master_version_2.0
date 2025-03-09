// routes/blast-event.routes.js
/*const router = require('express').Router();
const blastEventController = require('../controllers/blast-event.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');
const upload = require('../middleware/upload.middleware');

/**
 * @route   POST /api/blast-events
 * @desc    Create a new blast event
 * @access  Private - Admin, Site Engineer
 
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.createBlastEvent
);

/**
 * @route   GET /api/blast-events/daily/:daily_blast_id
 * @desc    Get all blast events for a daily operation
 * @access  Private - Admin, Site Engineer
 
router.get('/daily/:daily_blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.getBlastEvents
);

/**
 * @route   GET /api/blast-events/:blast_id
 * @desc    Get blast event details
 * @access  Private - Admin, Site Engineer
 
router.get('/:blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.getBlastEvent
);

/**
 * @route   PUT /api/blast-events/:blast_id
 * @desc    Update blast event
 * @access  Private - Admin, Site Engineer
 
router.put('/:blast_id',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.updateBlastEvent
);

/**
 * @route   POST /api/blast-events/:blast_id/pattern
 * @desc    Upload blast pattern sketch
 * @access  Private - Admin, Site Engineer
 
router.post('/:blast_id/pattern',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess,
        upload.single('pattern')
    ],
    blastEventController.uploadBlastPattern
);

/**
 * @route   PUT /api/blast-events/:blast_id/complete
 * @desc    Complete blast event
 * @access  Private - Admin, Site Engineer
 
router.put('/:blast_id/complete',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.completeBlastEvent
);

/**
 * @route   PUT /api/blast-events/:blast_id/cancel
 * @desc    Cancel blast event
 * @access  Private - Admin, Site Engineer
 
router.put('/:blast_id/cancel',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.cancelBlastEvent
);

/**
 * @route   GET /api/blast-events/:blast_id/summary
 * @desc    Get blast event summary including explosives
 * @access  Private - Admin, Site Engineer
 
router.get('/:blast_id/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.getBlastSummary
);

/**
 * @route   POST /api/blast-events/:blast_id/validate
 * @desc    Validate blast event parameters
 * @access  Private - Admin, Site Engineer
 
router.post('/:blast_id/validate',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    blastEventController.validateBlastEvent
);

module.exports = router;*/


// routes/blast-event.routes.js
const router = require('express').Router();
const blastEventController = require('../controllers/blast-event.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');
const { delayPatternUpload } = require('../middleware/upload.middleware');

/**
 * @route   POST /api/blast-event
 * @desc    Create new blast event for a daily operation
 * @access  Private - Site Engineer
 */
router.post('/',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), //verifyMiningSiteAccess, need to make access controll
    delayPatternUpload.single('delay_pattern_sketch')],
    blastEventController.createBlastEvent
);


/**
 * @route   POST /api/blast-event/:blast_id/pattern-sketch
 * @desc    Upload blast pattern sketch with delay numbers
 * @access  Private - Site Engineer
 */
router.post('/:blast_id/delay-pattern',
    [
        verifyToken, 
        hasRole([ROLES.SITE_ENGINEER]), 
        verifyMiningSiteAccess,
        delayPatternUpload.single('delay_pattern_sketch')
    ],
    blastEventController.uploadPatternSketch
);

/**
 * @route   GET /api/blast-event/daily/:daily_blast_id
 * @desc    Get all blast events for a daily operation
 * @access  Private - Site Engineer
 */
router.get('/daily/:daily_blast_id',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), 
    //verifyMiningSiteAccess
],
    blastEventController.getBlastEvents
);

/**
 * @route   POST /api/blast-event/:blast_id/holes
 * @desc    Create multiple blast holes with explosive usage
 * @access  Private - Site Engineer
 */
router.post('/:blast_id/holes',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    blastEventController.createBlastHoles
);

/**
 * @route   GET /api/blast-event/:blast_id/explosive-usage
 * @desc    Get explosive usage summary for blast
 * @access  Private - Site Engineer
 */
router.get('/:blast_id/explosive-usage',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), verifyMiningSiteAccess],
    blastEventController.getExplosiveUsage
);

/**
 * @route   PUT /api/blast-event/:blast_id/status
 * @desc    Update blast event status
 * @access  Private - Site Engineer
 */
router.put('/:blast_id/status',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]),
     //verifyMiningSiteAccess
    ],
    blastEventController.updateStatus
);

/**
 * @route   POST /api/blast-event/:blast_id/complete
 * @desc    Complete blast event with results
 * @access  Private - Site Engineer
 */
router.post('/:blast_id/complete',
    [verifyToken, hasRole([ROLES.SITE_ENGINEER]), 
    //verifyMiningSiteAccess
],
    blastEventController.completeBlastEvent
);


// GET route for completion summary
router.get('/:blast_id/completion-summary',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        //verifyMiningSiteAccess 
    ],
    blastEventController.getCompletionSummary
 );

module.exports = router;