// routes/monitoring-location.routes.js
const express = require('express');
const router = express.Router();
const monitoringLocationController = require('../controllers/monitoring-location.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

// Monitoring Location Management
router.post(
    '/',
    monitoringLocationController.createLocation
);

router.post(
    '/bulk',
    monitoringLocationController.bulkCreateLocations
);

router.put(
    '/:locationId',
    monitoringLocationController.updateLocation
);

router.get(
    '/:locationId',
    monitoringLocationController.getLocationById
);

// Site Related Routes
router.get(
    '/site/:siteId/locations',
    monitoringLocationController.getLocationsBySite
);

// Monitoring History
router.get(
    '/:locationId/history',
    monitoringLocationController.getLocationWithMonitoringHistory
);

// Status Management
router.patch(
    '/:locationId/deactivate',
    monitoringLocationController.deactivateLocation
);

// Distance Based Queries
router.get(
    '/by-distance',
    monitoringLocationController.getLocationsByDistance
);

// Statistics
router.get(
    '/:locationId/statistics',
    monitoringLocationController.getMonitoringStatistics
);

module.exports = router;