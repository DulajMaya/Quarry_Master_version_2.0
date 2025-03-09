// explosive-permit.routes.js

const router = require('express').Router();
const explosivePermitController = require('../controllers/explosive-permit.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess } = require('../middleware/access-control.middleware');
const {permitUpload} = require('../middleware/upload.middleware'); // need to create with multer

/**
 * @route   POST /api/permits
 * @desc    Create new explosive permit
 * @access  Private - Site Engineer
 */
/*router.post('/',
    [
        permitUpload.single('permitPhoto'),
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess 
        
    ],
    explosivePermitController.createPermit
);*/


router.post('/',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    explosivePermitController.createPermit
);

router.post('/test-permit-notification', verifyToken, async (req, res) => {
    try {
        const notificationService = require('../notifications/services/notification.service');
        await notificationService.sendPermitStatusNotification(
            'TEST001', // permitId
            'APPROVED', // status
            {
                permitNumber: 'TEST001',
                // other permit data
            },
            req.userId
        );
        res.json({ success: true, message: 'Permit notification sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/permits/:permitId
 * @desc    Get permit details
 * @access  Private - All authenticated users with access
 */
router.get('/:permitId',
    [
        verifyToken
        // verifyMiningSiteAccess, not in the access-control
    ],
    explosivePermitController.getPermitDetails
);

/**
 * @route   GET /api/permits/site/:miningSiteId
 * @desc    Get all permits for a mining site
 * @access  Private - Site Engineer, Controller
 */
router.get('/site/:miningSiteId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyMiningSiteAccess
    ],
    explosivePermitController.getMiningSitePermits
);

/**
 * @route   PATCH /api/permits/:permitId/status
 * @desc    Update permit status
 * @access  Private - Controller, Admin
 */
/*router.patch('/:permitId/status',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER, ROLES.ADMIN])
    ],
    explosivePermitController.updatePermitStatus
);*/

router.patch('/:permitId/status',
    [
        permitUpload.single('permitPhoto'),  // Add photo upload middleware
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER, ROLES.ADMIN])
    ],
    explosivePermitController.updatePermitStatus
);

/**
 * @route   PUT /api/permits/:permitId/quantities
 * @desc    Update remaining quantities
 * @access  Private - Site Engineer
 */
router.put('/:permitId/quantities',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
         verifyMiningSiteAccess
    ],
    explosivePermitController.updateRemainingQuantities
);

/**
 * @route   GET /api/permits/:permitId/usage
 * @desc    Get permit usage history
 * @access  Private - Site Engineer, Controller
 */
router.get('/:permitId/usage',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyMiningSiteAccess
    ],
    explosivePermitController.getPermitUsageHistory
);

/**
 * @route   GET /api/permits/expiring
 * @desc    Get list of expiring permits
 * @access  Private - Controller, Admin
 */
router.get('/expiring',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER, ROLES.ADMIN])
    ],
    explosivePermitController.getExpiringPermits
);

/**
 * @route   GET /api/permits/:permitId/report
 * @desc    Generate permit report
 * @access  Private - All authenticated users with access
 */
router.get('/:permitId/report',
    [
        verifyToken,
        verifyMiningSiteAccess
    ],
    explosivePermitController.generatePermitReport
);

/**
 * @route   POST /api/permits/:permitId/photo
 * @desc    Upload permit photo
 * @access  Private - Site Engineer
 */
router.post('/:permitId/photo',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess,
        permitUpload.single('permitPhoto')
    ],
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }

            const photoUrl = await explosivePermitController.handlePermitPhotoUpload(
                req.file,
                req.params.permitId
            );

            res.json({
                status: 'success',
                message: 'Photo uploaded successfully',
                data: { photoUrl }
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error uploading photo'
            });
        }
    }
);

/**
 * @route   GET /api/permits/controller/:controllerId
 * @desc    Get permits assigned to a controller
 * @access  Private - Controller
 */
/*router.get('/controller/:controllerId',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER])
    ],
    async (req, res) => {
        try {
            if (req.userRole === ROLES.EXPLOSIVE_CONTROLLER && 
                req.referenceId !== req.params.controllerId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Unauthorized access'
                });
            }

            const permits = await explosivePermitController.getControllerPermits(
                req.params.controllerId,
                req.query.status
            );

            res.json({
                status: 'success',
                data: permits
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving permits'
            });
        }
    }
);*/

router.get('/controller/:controllerId',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER])
    ],
    explosivePermitController.getControllerPermits
);


/*router.get('/controller/:controllerId', 
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER])
    ], 
    explosivePermitController.getControllerPermits
);*/
/**
 * @route   GET /api/permits/:permitId/allowed-explosives
 * @desc    Get allowed explosives for a permit
 * @access  Private - All authenticated users with access
 */
router.get('/:permitId/allowed-explosives',
    [
        verifyToken,
        verifyMiningSiteAccess
    ],
    async (req, res) => {
        try {
            const allowedExplosives = await explosivePermitController.getAllowedExplosives(
                req.params.permitId
            );

            res.json({
                status: 'success',
                data: allowedExplosives
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving allowed explosives'
            });
        }
    }
);

/**
 * @route   GET /api/permits/summary
 * @desc    Get permits summary report
 * @access  Private - Admin, Controller
 */
router.get('/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])
    ],
    async (req, res) => {
        try {
            const summary = await explosivePermitController.getPermitsSummary({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                status: req.query.status,
                miningSiteId: req.query.miningSiteId
            });

            res.json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating summary'
            });
        }
    }
);

/**
 * @route   POST /api/permits/validate
 * @desc    Validate permit data before creation
 * @access  Private - Site Engineer
 */
router.post('/validate',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER])
    ],
    async (req, res) => {
        try {
            const errors = await explosivePermitController.validatePermitData(req.body);

            res.json({
                status: 'success',
                data: {
                    isValid: errors.length === 0,
                    errors
                }
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error validating permit data'
            });
        }
    }
);

module.exports = router;