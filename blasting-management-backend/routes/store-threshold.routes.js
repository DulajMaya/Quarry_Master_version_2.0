// store-threshold.routes.js

const router = require('express').Router();
const storeThresholdController = require('../controllers/store-threshold.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyStoreAccess } = require('../middleware/access-control.middleware');

/**
 * @route   POST /api/thresholds
 * @desc    Create new threshold
 * @access  Private (Admin, Site Engineer)
 */
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    storeThresholdController.createThreshold
);

/**
 * @route   PUT /api/thresholds/:thresholdId
 * @desc    Update existing threshold
 * @access  Private (Admin, Site Engineer)
 */
router.put('/:thresholdId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    storeThresholdController.updateThreshold
);

/**
 * @route   GET /api/thresholds/:thresholdId
 * @desc    Get threshold details
 * @access  Private (All authenticated users)
 */
router.get('/:thresholdId',
    [
        verifyToken,
        verifyStoreAccess
    ],
    storeThresholdController.getThresholdDetails
);

/**
 * @route   GET /api/thresholds/store/:storeId
 * @desc    Get all thresholds for a store
 * @access  Private (All authenticated users)
 */
router.get('/store/:storeId',
    [
        verifyToken,
        verifyStoreAccess
    ],
    storeThresholdController.getStoreThresholds
);

/**
 * @route   GET /api/thresholds/:thresholdId/history
 * @desc    Get threshold history
 * @access  Private (Admin, Site Engineer)
 */
router.get('/:thresholdId/history',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    storeThresholdController.getThresholdHistory
);

/**
 * @route   GET /api/thresholds/store/:storeId/alerts
 * @desc    Get active alerts for a store
 * @access  Private (All authenticated users)
 */
router.get('/store/:storeId/alerts',
    [
        verifyToken,
        verifyStoreAccess
    ],
    storeThresholdController.getActiveAlerts
);

/**
 * @route   PATCH /api/thresholds/alerts/:alertId
 * @desc    Update alert status
 * @access  Private (Admin, Site Engineer)
 */
router.patch('/alerts/:alertId',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER])
    ],
    storeThresholdController.updateAlertStatus
);

/**
 * @route   POST /api/thresholds/store/:storeId/check
 * @desc    Manually check inventory levels against thresholds
 * @access  Private (Admin, Site Engineer)
 */
router.post('/store/:storeId/check',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    storeThresholdController.checkInventoryLevels
);

/**
 * @route   GET /api/thresholds/store/:storeId/summary
 * @desc    Get threshold summary report
 * @access  Private (Admin, Site Engineer)
 */
router.get('/store/:storeId/summary',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    storeThresholdController.getThresholdSummary
);

/**
 * @route   GET /api/thresholds/store/:storeId/critical
 * @desc    Get critical level items
 * @access  Private (All authenticated users)
 */
/* no controller created
router.get('/store/:storeId/critical',
    [
        verifyToken,
        verifyStoreAccess
    ],
    storeThresholdController.getCriticalItems
);

/**
 * @route   PATCH /api/thresholds/:thresholdId/notification-settings
 * @desc    Update threshold notification settings
 * @access  Private (Admin, Site Engineer)
 
router.patch('/:thresholdId/notification-settings',
    [
        verifyToken,
        hasRole([ROLES.ADMIN, ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    async (req, res) => {
        try {
            const settings = await storeThresholdController.updateNotificationSettings(
                req.params.thresholdId,
                {
                    emailNotification: req.body.emailNotification,
                    notificationFrequency: req.body.notificationFrequency,
                    alertPercentage: req.body.alertPercentage
                }
            );

            res.json({
                status: 'success',
                message: 'Notification settings updated successfully',
                data: settings
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating notification settings'
            });
        }
    }
);

/**
 * @route   GET /api/thresholds/reports/monthly
 * @desc    Get monthly threshold report
 * @access  Private (Admin)
 
router.get('/reports/monthly',
    [
        verifyToken,
        hasRole(ROLES.ADMIN)
    ],
    async (req, res) => {
        try {
            const report = await storeThresholdController.generateMonthlyReport(
                req.query.month,
                req.query.year
            );

            res.json({
                status: 'success',
                data: report
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating monthly report'
            });
        }
    }
);

/**
 * @route   POST /api/thresholds/bulk-update
 * @desc    Bulk update thresholds
 * @access  Private (Admin)
 
router.post('/bulk-update',
    [
        verifyToken,
        hasRole(ROLES.ADMIN)
    ],
    async (req, res) => {
        try {
            const results = await storeThresholdController.bulkUpdateThresholds(
                req.body.thresholds
            );

            res.json({
                status: 'success',
                message: 'Thresholds updated successfully',
                data: results
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating thresholds'
            });
        }
    }
);*/

module.exports = router;