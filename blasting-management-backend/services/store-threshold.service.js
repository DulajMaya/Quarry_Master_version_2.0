// store-threshold.service.js

const { 
    StoreThreshold, 
    ThresholdHistory, 
    ThresholdAlert,
    ExplosiveStore,
    ExplosiveType,
    StoreInventory 
} = require('../models');
const { generateThresholdId, generateHistoryId, generateAlertId } = require('./id-generator.service');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

class StoreThresholdService {
    /**
     * Create new threshold for store explosive type
     */
    async createThreshold(data, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Validate if threshold already exists
            const existingThreshold = await StoreThreshold.findOne({
                where: {
                    StoreID: data.storeId,
                    ExplosiveTypeID: data.explosiveTypeId,
                    Status: 'Active'
                }
            });

            if (existingThreshold) {
                throw { 
                    status: 400, 
                    message: 'Active threshold already exists for this explosive type' 
                };
            }

            // Generate IDs
            const thresholdId = await generateThresholdId();
            const historyId = await generateHistoryId();

            // Create threshold
            const threshold = await StoreThreshold.create({
                ThresholdID: thresholdId,
                StoreID: data.storeId,
                ExplosiveTypeID: data.explosiveTypeId,
                MinimumQuantity: data.minimumQuantity,
                CriticalQuantity: data.criticalQuantity,
                MaximumQuantity: data.maximumQuantity,
                AlertPercentage: data.alertPercentage || 20,
                NotificationFrequency: data.notificationFrequency || 'Daily',
                EmailNotification: data.emailNotification !== false,
                Status: 'Active',
                LastUpdatedBy: userId
            }, { transaction });

            // Record history
            await ThresholdHistory.create({
                HistoryID: historyId,
                ThresholdID: thresholdId,
                ChangeType: 'Created',
                NewMinimum: data.minimumQuantity,
                NewCritical: data.criticalQuantity,
                NewMaximum: data.maximumQuantity,
                ChangedBy: userId,
                Remarks: 'Initial threshold creation'
            }, { transaction });

            await transaction.commit();

            // Check current inventory against new threshold
            await this.checkInventoryAgainstThreshold(threshold);

            return threshold;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update existing threshold
     */
    async updateThreshold(thresholdId, data, userId) {
        const transaction = await sequelize.transaction();

        try {
            const threshold = await StoreThreshold.findByPk(thresholdId);
            if (!threshold) {
                throw { status: 404, message: 'Threshold not found' };
            }

            const historyId = await generateHistoryId();

            // Record history before update
            await ThresholdHistory.create({
                HistoryID: historyId,
                ThresholdID: thresholdId,
                ChangeType: 'Updated',
                PreviousMinimum: threshold.MinimumQuantity,
                NewMinimum: data.minimumQuantity,
                PreviousCritical: threshold.CriticalQuantity,
                NewCritical: data.criticalQuantity,
                PreviousMaximum: threshold.MaximumQuantity,
                NewMaximum: data.maximumQuantity,
                ChangedBy: userId,
                Remarks: data.remarks || 'Threshold update'
            }, { transaction });

            // Update threshold
            await threshold.update({
                MinimumQuantity: data.minimumQuantity,
                CriticalQuantity: data.criticalQuantity,
                MaximumQuantity: data.maximumQuantity,
                AlertPercentage: data.alertPercentage,
                NotificationFrequency: data.notificationFrequency,
                EmailNotification: data.emailNotification,
                LastUpdatedBy: userId
            }, { transaction });

            await transaction.commit();

            // Check current inventory against updated threshold
            await this.checkInventoryAgainstThreshold(threshold);

            return threshold;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get threshold details with history and alerts
     */
    async getThresholdDetails(thresholdId) {
        try {
            return await StoreThreshold.findOne({
                where: { ThresholdID: thresholdId },
                include: [
                    {
                        model: ExplosiveStore,
                        attributes: ['StoreName']
                    },
                    {
                        model: ExplosiveType,
                        attributes: ['TypeName']
                    },
                    {
                        model: ThresholdHistory,
                        limit: 10,
                        order: [['CreatedAt', 'DESC']]
                    },
                    {
                        model: ThresholdAlert,
                        where: { Status: 'Active' },
                        required: false
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get all thresholds for a store
     */
    async getStoreThresholds(storeId) {
        try {
            return await StoreThreshold.findAll({
                where: { 
                    StoreID: storeId,
                    Status: 'Active'
                },
                include: [
                    {
                        model: ExplosiveType,
                        attributes: ['TypeName']
                    },
                    {
                        model: ThresholdAlert,
                        where: { Status: 'Active' },
                        required: false
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check inventory against threshold and create alerts
     */
    async checkInventoryAgainstThreshold(threshold) {
        try {
            const inventory = await StoreInventory.findOne({
                where: {
                    StoreID: threshold.StoreID,
                    ExplosiveTypeID: threshold.ExplosiveTypeID
                }
            });

            if (!inventory) return;

            const currentQuantity = Number(inventory.CurrentQuantity);

            // Check different threshold conditions
            if (currentQuantity <= threshold.CriticalQuantity) {
                await this.createAlert(threshold, 'Below_Critical', currentQuantity);
            } else if (currentQuantity <= threshold.MinimumQuantity) {
                await this.createAlert(threshold, 'Below_Minimum', currentQuantity);
            } else if (currentQuantity > threshold.MaximumQuantity) {
                await this.createAlert(threshold, 'Above_Maximum', currentQuantity);
            }
        } catch (error) {
            console.error('Error checking inventory against threshold:', error);
            throw error;
        }
    }

    /**
     * Create threshold alert
     */
    async createAlert(threshold, alertType, currentQuantity) {
        try {
            // Check if active alert already exists
            const existingAlert = await ThresholdAlert.findOne({
                where: {
                    ThresholdID: threshold.ThresholdID,
                    AlertType: alertType,
                    Status: 'Active'
                }
            });

            if (existingAlert) return;

            const alertId = await generateAlertId();

            const alert = await ThresholdAlert.create({
                AlertID: alertId,
                ThresholdID: threshold.ThresholdID,
                AlertType: alertType,
                CurrentQuantity: currentQuantity,
                ThresholdValue: this.getThresholdValue(threshold, alertType),
                Status: 'Active'
            });

            // Send notification if enabled
            if (threshold.EmailNotification && threshold.shouldSendNotification()) {
                await this.sendAlertNotification(threshold, alert);
            }

            return alert;
        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }

    /**
     * Get threshold value based on alert type
     */
    getThresholdValue(threshold, alertType) {
        switch (alertType) {
            case 'Below_Critical':
                return threshold.CriticalQuantity;
            case 'Below_Minimum':
                return threshold.MinimumQuantity;
            case 'Above_Maximum':
                return threshold.MaximumQuantity;
            default:
                return 0;
        }
    }

    /**
     * Send alert notification
     */
    async sendAlertNotification(threshold, alert) {
        try {
            const store = await ExplosiveStore.findByPk(threshold.StoreID);
            const explosiveType = await ExplosiveType.findByPk(threshold.ExplosiveTypeID);

            const transporter = nodemailer.createTransport({
                // Email configuration from environment variables
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: store.ContactEmail,
                subject: `Inventory Alert - ${store.StoreName}`,
                html: this.generateAlertEmailTemplate(store, explosiveType, alert)
            });

            // Update notification status
            await alert.update({
                NotificationSent: true,
                NotificationDate: new Date()
            });

            // Update threshold last notification date
            await threshold.update({
                LastNotificationDate: new Date()
            });
        } catch (error) {
            console.error('Error sending notification:', error);
            // Don't throw error to prevent transaction rollback
        }
    }

    /**
     * Generate email template for alert
     */
    generateAlertEmailTemplate(store, explosiveType, alert) {
        return `
            <h2>Inventory Alert</h2>
            <p><strong>Store:</strong> ${store.StoreName}</p>
            <p><strong>Explosive Type:</strong> ${explosiveType.TypeName}</p>
            <p><strong>Alert Type:</strong> ${alert.AlertType.replace('_', ' ')}</p>
            <p><strong>Current Quantity:</strong> ${alert.CurrentQuantity}</p>
            <p><strong>Threshold Value:</strong> ${alert.ThresholdValue}</p>
            <p>Please take necessary action.</p>
        `;
    }
}

module.exports = new StoreThresholdService();