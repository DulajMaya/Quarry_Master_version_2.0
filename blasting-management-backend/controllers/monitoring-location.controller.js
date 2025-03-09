// controllers/monitoring-location.controller.js
const monitoringLocationService = require('../services/monitoring-location.service');
const {validateCreateMonitoringLocation,
    validateUpdateMonitoringLocation,
    validateBulkMonitoringLocations,
    isValidPhoneNumber,
    isValidEmail  } = require('../utils/validateInput-monitoring-location');
const { formatResponse, errorResponse } = require('../utils/response');

class MonitoringLocationController {
    async createLocation(req, res) {
        try {
            const validationRules = {
                site_id: { type: 'number', required: true },
                kadawala_gps_north: { type: 'number', required: true },
                kadawala_gps_east: { type: 'number', required: true },
                owners_name: { type: 'string', required: true },
                address: { type: 'string', required: true },
                telephone_number: { type: 'string', required: false },
                email_address: { type: 'email', required: false },
                location_description: { type: 'string', required: false }
            };

            const validatedData = validateCreateMonitoringLocation(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const location = await monitoringLocationService.createLocation(req.body);
            return formatResponse(res, 201, 'Monitoring location created successfully', location);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async updateLocation(req, res) {
        try {
            const { locationId } = req.params;
            const validationRules = {
                kadawala_gps_north: { type: 'number', required: false },
                kadawala_gps_east: { type: 'number', required: false },
                owners_name: { type: 'string', required: false },
                address: { type: 'string', required: false },
                telephone_number: { type: 'string', required: false },
                email_address: { type: 'email', required: false },
                location_description: { type: 'string', required: false }
            };

            const validatedData = validateUpdateMonitoringLocation(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const location = await monitoringLocationService.updateLocation(locationId, req.body);
            return formatResponse(res, 200, 'Monitoring location updated successfully', location);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getLocationById(req, res) {
        try {
            const { locationId } = req.params;
            const location = await monitoringLocationService.getLocationById(locationId);
            return formatResponse(res, 200, 'Monitoring location retrieved successfully', location);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getLocationsBySite(req, res) {
        try {
            const { siteId } = req.params;
            const locations = await monitoringLocationService.getLocationsBySite(siteId);
            return formatResponse(res, 200, 'Monitoring locations retrieved successfully', locations);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getLocationWithMonitoringHistory(req, res) {
        try {
            const { locationId } = req.params;
            const location = await monitoringLocationService.getLocationWithMonitoringHistory(locationId);
            return formatResponse(res, 200, 'Location monitoring history retrieved successfully', location);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async deactivateLocation(req, res) {
        try {
            const { locationId } = req.params;
            const location = await monitoringLocationService.deactivateLocation(locationId);
            return formatResponse(res, 200, 'Monitoring location deactivated successfully', location);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getLocationsByDistance(req, res) {
        try {
            const { siteId, maxDistanceKm } = req.query;
            const locations = await monitoringLocationService.getLocationsByDistance(siteId, maxDistanceKm);
            return formatResponse(res, 200, 'Locations retrieved by distance successfully', locations);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getMonitoringStatistics(req, res) {
        try {
            const { locationId } = req.params;
            const stats = await monitoringLocationService.getMonitoringStatistics(locationId);
            return formatResponse(res, 200, 'Monitoring statistics retrieved successfully', stats);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async bulkCreateLocations(req, res) {
        try {
            const validationRules = {
                locations: {
                    type: 'array',
                    required: true,
                    arrayType: {
                        site_id: { type: 'number', required: true },
                        kadawala_gps_north: { type: 'number', required: true },
                        kadawala_gps_east: { type: 'number', required: true },
                        owners_name: { type: 'string', required: true },
                        address: { type: 'string', required: true }
                    }
                }
            };

            const validatedData = validateBulkMonitoringLocations(req.body.locations, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const locations = await monitoringLocationService.bulkCreateLocations(req.body.locations);
            return formatResponse(res, 201, 'Monitoring locations created successfully', locations);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new MonitoringLocationController();