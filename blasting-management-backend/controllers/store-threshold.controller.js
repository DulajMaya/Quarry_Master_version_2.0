// store-threshold.controller.js

const storeThresholdService = require('../services/store-threshold.service');

class StoreThresholdController {
    /**
     * Create new threshold
     */
    async createThreshold(req, res) {
        try {
            const validationErrors = await this.validateThresholdData(req.body);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const threshold = await storeThresholdService.createThreshold(
                {
                    storeId: req.body.storeId,
                    explosiveTypeId: req.body.explosiveTypeId,
                    minimumQuantity: req.body.minimumQuantity,
                    criticalQuantity: req.body.criticalQuantity,
                    maximumQuantity: req.body.maximumQuantity,
                    alertPercentage: req.body.alertPercentage,
                    notificationFrequency: req.body.notificationFrequency,
                    emailNotification: req.body.emailNotification
                },
                req.userId
            );

            res.status(201).json({
                status: 'success',
                message: 'Threshold created successfully',
                data: threshold
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error creating threshold'
            });
        }
    }

    /**
     * Update existing threshold
     */
    async updateThreshold(req, res) {
        try {
            const validationErrors = await this.validateThresholdData(req.body);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const threshold = await storeThresholdService.updateThreshold(
                req.params.thresholdId,
                {
                    minimumQuantity: req.body.minimumQuantity,
                    criticalQuantity: req.body.criticalQuantity,
                    maximumQuantity: req.body.maximumQuantity,
                    alertPercentage: req.body.alertPercentage,
                    notificationFrequency: req.body.notificationFrequency,
                    emailNotification: req.body.emailNotification,
                    remarks: req.body.remarks
                },
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Threshold updated successfully',
                data: threshold
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating threshold'
            });
        }
    }

    /**
     * Get threshold details
     */
    async getThresholdDetails(req, res) {
        try {
            const threshold = await storeThresholdService.getThresholdDetails(req.params.thresholdId);
            
            if (!threshold) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Threshold not found'
                });
            }

            res.json({
                status: 'success',
                data: threshold
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving threshold details'
            });
        }
    }

    /**
     * Get all thresholds for a store
     */
    async getStoreThresholds(req, res) {
        try {
            const thresholds = await storeThresholdService.getStoreThresholds(req.params.storeId);

            res.json({
                status: 'success',
                data: thresholds
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving store thresholds'
            });
        }
    }

    /**
     * Get threshold history
     */
    async getThresholdHistory(req, res) {
        try {
            const history = await storeThresholdService.getThresholdHistory(
                req.params.thresholdId,
                {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 10
                }
            );

            res.json({
                status: 'success',
                data: history
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving threshold history'
            });
        }
    }

    /**
     * Get active alerts
     */
    async getActiveAlerts(req, res) {
        try {
            const alerts = await storeThresholdService.getActiveAlerts(
                req.params.storeId,
                req.query.explosiveTypeId
            );

            res.json({
                status: 'success',
                data: alerts
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving active alerts'
            });
        }
    }

    /**
     * Update alert status
     */
    async updateAlertStatus(req, res) {
        try {
            const alert = await storeThresholdService.updateAlertStatus(
                req.params.alertId,
                req.body.status,
                req.body.remarks,
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Alert status updated successfully',
                data: alert
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating alert status'
            });
        }
    }

    /**
     * Manually check inventory against thresholds
     */
    async checkInventoryLevels(req, res) {
        try {
            const results = await storeThresholdService.checkAllInventoryLevels(
                req.params.storeId
            );

            res.json({
                status: 'success',
                message: 'Inventory check completed',
                data: results
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error checking inventory levels'
            });
        }
    }

    /**
     * Get threshold summary report
     */
    async getThresholdSummary(req, res) {
        try {
            const summary = await storeThresholdService.generateThresholdSummary(
                req.params.storeId,
                req.query.startDate,
                req.query.endDate
            );

            res.json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating threshold summary'
            });
        }
    }

    /**
     * Validate threshold data
     */
    async validateThresholdData(data) {
        const errors = [];

        if (!data.minimumQuantity || data.minimumQuantity < 0) {
            errors.push('Valid minimum quantity is required');
        }

        if (!data.criticalQuantity || data.criticalQuantity < 0) {
            errors.push('Valid critical quantity is required');
        }

        if (!data.maximumQuantity || data.maximumQuantity <= 0) {
            errors.push('Valid maximum quantity is required');
        }

        if (data.criticalQuantity > data.minimumQuantity) {
            errors.push('Critical quantity must be less than or equal to minimum quantity');
        }

        if (data.minimumQuantity >= data.maximumQuantity) {
            errors.push('Minimum quantity must be less than maximum quantity');
        }

        if (data.alertPercentage && (data.alertPercentage < 1 || data.alertPercentage > 100)) {
            errors.push('Alert percentage must be between 1 and 100');
        }

        return errors;
    }
}

module.exports = new StoreThresholdController();