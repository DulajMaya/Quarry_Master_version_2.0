// notifications/routes/notification.routes.js

const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/',
    verifyToken,
    notificationController.getUserNotifications
);

/**
 * @route   GET /api/notifications/count
 * @desc    Get user's unread notification count
 * @access  Private
 
router.get('/count',
    verifyToken,
    notificationController.getUnreadCount
);*/

/**
 * @route   PATCH /api/notifications/:notificationId/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/:notificationId/read',
    verifyToken,
    notificationController.markAsRead
);

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch('/mark-all-read',
    verifyToken,
    notificationController.markAllAsRead
);

module.exports = router;