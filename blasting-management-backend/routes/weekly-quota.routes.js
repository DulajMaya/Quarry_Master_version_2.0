// weekly-quota.routes.js
/*
const router = require('express').Router();
const weeklyQuotaController = require('../controllers/weekly-quota.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess, verifyPermitAccess } = require('../middleware/access-control.middleware');
const  {upload}  = require('../middleware/upload.middleware'); 
const { quotaSealUpload } = require('../middleware/upload.middleware');



/**
 * @route   POST /api/quotas
 * @desc    Create new quota request
 * @access  Private - Site Engineer
 
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    weeklyQuotaController.createQuotaRequest
);


/**
 * @route   GET /api/quotas/pending
 * @desc    Get pending quotas for controller
 * @access  Private - Controller
 
router.get('/pending',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER])
    ],
    weeklyQuotaController.getPendingQuotas
);



/**
 * @route   GET /api/quotas/:quotaId
 * @desc    Get quota details
 * @access  Private - All authenticated users with access
 
router.get('/:quotaId',
    [
        verifyToken,
        verifyPermitAccess
    ],
    weeklyQuotaController.getQuotaDetails
);

/**
 * @route   GET /api/quotas/permit/:permitId
 * @desc    Get all quotas for a permit
 * @access  Private - Site Engineer, Controller
 
router.get('/permit/:permitId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.getPermitQuotas
);

/**
 * @route   PATCH /api/quotas/:quotaId/status
 * @desc    Update quota status (Approve/Reject)
 * @access  Private - Controller
 
router.patch('/:quotaId/status',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER]),
        quotaSealUpload.single('quotaSeal')
    ],
    weeklyQuotaController.updateQuotaStatus
);

/**
 * @route   POST /api/quotas/:quotaId/usage
 * @desc    Record quota usage
 * @access  Private - Site Engineer
 
router.post('/:quotaId/usage',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.recordQuotaUsage
);



/**
 * @route   GET /api/quotas/:quotaId/usage-history
 * @desc    Get quota usage history
 * @access  Private - Site Engineer, Controller
 
router.get('/:quotaId/usage-history',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.getQuotaUsageHistory
);

/**
 * @route   POST /api/quotas/:quotaId/cancel
 * @desc    Cancel quota request
 * @access  Private - Site Engineer, Controller
 
router.post('/:quotaId/cancel',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.cancelQuota
);

/**
 * @route   GET /api/quotas/permit/:permitId/summary
 * @desc    Generate quota summary for permit
 * @access  Private - Site Engineer, Controller
 
router.get('/permit/:permitId/summary',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.generateQuotaSummary
);

/**
 * @route   GET /api/quotas/expiring
 * @desc    Get expiring quotas
 * @access  Private - Controller, Admin
 
router.get('/expiring',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER, ROLES.ADMIN])
    ],
    async (req, res) => {
        try {
            const quotas = await weeklyQuotaController.getExpiringQuotas();
            res.json({
                status: 'success',
                data: quotas
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving expiring quotas'
            });
        }
    }
);

/**
 * @route   POST /api/quotas/validate
 * @desc    Validate quota data before submission
 * @access  Private - Site Engineer
 
router.post('/validate',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER])
    ],
    async (req, res) => {
        try {
            const errors = await weeklyQuotaController.validateQuotaData(req.body);
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
                message: error.message || 'Validation error'
            });
        }
    }
);

/**
 * @route   GET /api/quotas/analytics/usage
 * @desc    Get quota usage analytics
 * @access  Private - Admin, Controller
 
router.get('/analytics/usage',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])
    ],
    async (req, res) => {
        try {
            const analytics = await weeklyQuotaController.getUsageAnalytics({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                miningSiteId: req.query.miningSiteId
            });
            res.json({
                status: 'success',
                data: analytics
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating analytics'
            });
        }
    }
);



module.exports = router;*/

const router = require('express').Router();
const weeklyQuotaController = require('../controllers/weekly-quota.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyMiningSiteAccess, verifyPermitAccess } = require('../middleware/access-control.middleware');
const { quotaSealUpload } = require('../middleware/upload.middleware');

// 1. POST routes
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyMiningSiteAccess
    ],
    weeklyQuotaController.createQuotaRequest
);

router.post('/validate',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER])
    ],
    weeklyQuotaController.validateQuotaRequest
);



// 2. Static GET routes first
router.get('/pending',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER])
    ],
    weeklyQuotaController.getPendingQuotas
);

router.get('/expiring',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER, ROLES.ADMIN])
    ],
    async (req, res) => {
        try {
            const quotas = await weeklyQuotaController.getExpiringQuotas();
            res.json({
                status: 'success',
                data: quotas
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving expiring quotas'
            });
        }
    }
);

router.get('/analytics/usage',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.EXPLOSIVE_CONTROLLER])
    ],
    async (req, res) => {
        try {
            const analytics = await weeklyQuotaController.getUsageAnalytics({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                miningSiteId: req.query.miningSiteId
            });
            res.json({
                status: 'success',
                data: analytics
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating analytics'
            });
        }
    }
);


// 3. Multi-segment parameterized routes
router.get('/permit/:permitId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.getPermitQuotas
);

router.get('/permit/:permitId/summary',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.generateQuotaSummary
);

// 4. Single parameter routes

router.get('/:quotaId/usage-history',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
    ],
    weeklyQuotaController.getQuotaUsageHistory
);


router.get('/:quotaId',
    [
        verifyToken,
    ],
    weeklyQuotaController.getQuotaDetails
);



// 5. Other parameterized routes (PATCH, POST)
router.patch('/:quotaId/status',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_CONTROLLER]),
        quotaSealUpload.single('quotaSeal')
    ],
    weeklyQuotaController.updateQuotaStatus
);

router.post('/:quotaId/usage',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.recordQuotaUsage
);

router.post('/:quotaId/cancel',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_CONTROLLER]),
        verifyPermitAccess
    ],
    weeklyQuotaController.cancelQuota
);

module.exports = router;