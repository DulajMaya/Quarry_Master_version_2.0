// weekly-quota.service.js

const { 
    WeeklyQuota, 
    QuotaItems, 
    QuotaHistory, 
    QuotaUsage,
    ExplosivePermit,
    PermitAllowedExplosive,
    ExplosiveType
} = require('../models');
const { generateQuotaId, generateItemId, generateHistoryId, generateUsageId, generateQuotaHistoryId } = require('./id-generator.service');
const { sendEmail } = require('../utils/email.util');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');
const notificationService = require('../notifications/services/notification.service');

class WeeklyQuotaService {
    /**
     * Create new weekly quota request
     */
    async createQuotaRequest(data, userId) {
        const transaction = await sequelize.transaction();

        try {
            // Validate permit
            const permit = await ExplosivePermit.findOne({
                where: {
                    PermitID: data.permitId,
                    Status: 'Active',
                    ExpiryDate: {
                        [Op.gt]: new Date()
                    }
                },
                include: [{
                    model: PermitAllowedExplosive,
                    include: [ExplosiveType]
                }]
            });

            if (!permit) {
                throw { status: 400, message: 'Invalid or expired permit' };
            }
            /*
            // Check existing active quota
            const existingQuota = await WeeklyQuota.findOne({
                where: {
                    PermitID: data.permitId,
                    Status: {
                        [Op.in]: ['Pending', 'Approved']
                    },
                    ExpiryDate: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (existingQuota) {
                throw { 
                    status: 400, 
                    message: 'Active quota already exists for this permit' 
                };
            }*/

            // Calculate quota quantities
       const quotaItems = await this.calculateQuotaQuantities(data.permitId, data.validityPeriod || 7);


            // Validate quantities against permit remaining quantities
            //await this.validateRequestedQuantities(data.items, permit);

            // Generate IDs
            const quotaId = await generateQuotaId();

            // Create quota request
            const quota = await WeeklyQuota.create({
                QuotaID: quotaId,
                PermitID: data.permitId,
                RequestDate: new Date(),
                PlannedUsageDate: data.plannedUsageDate,
                Purpose: data.purpose,
                BlastingLocation: data.blastingLocation,
                BlastingTime: data.blastingTime,
                SafetyMeasures: data.safetyMeasures,
                ValidityPeriod: data.validityPeriod || 7,
                ExpiryDate: this.calculateExpiryDate(data.validityPeriod || 7),
                Status: 'Pending',
                CreatedBy: userId
            }, { transaction });

            // Create quota items
            for (const item of quotaItems) {
                const itemId = await generateItemId(transaction);
                await QuotaItems.create({
                    QuotaItemID: itemId,
                    QuotaID: quotaId,
                    ExplosiveTypeID: item.explosiveTypeId,
                    CalculatedQuantity: item.calculatedQuantity,
                    Unit: item.unit,
                    PurchaseStatus: 'Available'
                }, { transaction });
            }

            // Create history record
            const historyId = await generateQuotaHistoryId();
            await QuotaHistory.create({
                HistoryID: historyId,
                QuotaID: quotaId,
                ChangeType: 'Created',
                NewStatus: 'Pending',
                ChangedBy: userId,
                Remarks: 'Initial quota request'
            }, { transaction });

            await transaction.commit();

            // Send notification for new quota request
            await notificationService.sendQuotaStatusNotification(
                quotaId,
                'Pending',
                {
                    quotaId: quota.QuotaID,
                    permitNumber: permit.PermitNumber,
                    status: 'Pending',
                    remarks: "Initial quota request",
                    items: quotaItems.map(item => ({
                        explosiveType: item.explosiveTypeId, // This needs to be fetched or transformed
                        requestedQuantity: `${item.quantity} ${item.unit}`,
                        remarks: '-'
                    }))
                },
                userId
            );
            console.log('Quota notification data:', {
                quotaId: quota.QuotaID,
                items: quotaItems
            });


            

            // Send notification to controller
            //await this.notifyController(quota, 'new_request');
            /*
            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.QUOTA_STATUS,
                title: 'New Quota Request',
                message: `New quota request ${quota.QuotaID} received`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'QUOTA',
                referenceId: quota.QuotaID,
                recipients: await notificationService.getRecipientsByRole(['EXPLOSIVE_CONTROLLER']),
                emailTemplate: 'QUOTA_STATUS',
                emailData: {
                    status: 'Pending',
                    quotaId: quota.QuotaID,
                    permitNumber: permit.PermitNumber,
                    plannedUsageDate: data.plannedUsageDate,
                    purpose: data.purpose,
                    items: data.items,
                    blastingLocation: data.blastingLocation
                }
            });*/



            return await this.getQuotaDetails(quotaId);
        } catch (error) {
            await transaction.rollback();
            console.log(error);
            throw error;
        }
    }

    /**
     * Update quota status (Approve/Reject)
     */
    async updateQuotaStatus(quotaId, status, data, referenceId, userId) {
        const transaction = await sequelize.transaction();

        try {
            const quota = await WeeklyQuota.findOne({
                where: { QuotaID: quotaId },
                include: [{ 
                    model: QuotaItems,
                    include: [ExplosiveType]
                },
                {
                    model: ExplosivePermit,  // Add this to get permit number
                    attributes: ['PermitNumber']
                }
            ]
            });

            if (!quota) {
                throw { status: 404, message: 'Quota not found' };
            }

            if (quota.Status !== 'Pending') {
                throw { 
                    status: 400, 
                    message: 'Can only approve/reject pending quotas' 
                };
            }

            const previousStatus = quota.Status;

            if (status === 'Approved') {
                // Update quota
                await quota.update({
                    Status: 'Approved',
                    ApprovalDate: new Date(),
                    ApprovedBy: referenceId,
                    QuotaSealPhotoURL: data.quotaSealPhotoURL
                }, { transaction });

                /*

                // Update quota items with approved quantities
                for (const item of data.items) {
                    const quotaItem = await QuotaItems.findOne({
                        where: {
                            QuotaID: quotaId,
                            ExplosiveTypeID: item.explosiveTypeId
                        }
                    });

                    if (quotaItem) {
                        await quotaItem.update({
                            ApprovedQuantity: item.approvedQuantity,
                            Remarks: item.remarks
                        }, { transaction });
                    }
                }*/
            } else if (status === 'Rejected') {
                await quota.update({
                    Status: 'Rejected',
                    RejectionReason: data.reason
                }, { transaction });
            }

            // Create history record
            const historyId = await generateQuotaHistoryId();
            await QuotaHistory.create({
                HistoryID: historyId,
                QuotaID: quotaId,
                ChangeType: status === 'Approved' ? 'Approved' : 'Rejected',
                PreviousStatus: previousStatus,
                NewStatus: status,
                ChangedBy: userId,
                Remarks: data.reason || 'Quota ' + status.toLowerCase()
            }, { transaction });

            
            

            await transaction.commit();
            
            // Send status notification

            await notificationService.sendQuotaStatusNotification(
                quotaId,
                status,
                {
                    quotaId: quota.QuotaID,
                    permitNumber: quota.ExplosivePermit.PermitNumber,
                    status: status,
                    remarks: data.reason || '',
                    approvalDate: status === 'Approved' ? new Date() : null,
                    items: quota.QuotaItems.map(item => ({
                        explosiveTypeId: item.ExplosiveTypeID,
                        explosiveType: item.ExplosiveType.TypeName,
                        calculatedQuantity: item.CalculatedQuantity,
                        unit: item.Unit,
                        remarks: item.Remarks || '-'
                    }))
                },
                userId
            );


            return await this.getQuotaDetails(quotaId);
        } catch (error) {
            console.log(error);
            await transaction.rollback();
            throw error;
        }
    }


    // Helper method to get quota recipients
    async getQuotaRecipients(quota) {
        const siteEngineers = await notificationService.getRecipientsByRole(
            ['SITE_ENGINEER'],
            quota.ExplosivePermit.MiningSiteID
        );
        const controllers = await notificationService.getRecipientsByRole(
            ['EXPLOSIVE_CONTROLLER']
        );
        return [...siteEngineers, ...controllers];
    }

    /**
     * Record quota usage
     */
    async recordQuotaUsage(quotaId, usageData, userId) {
        const transaction = await sequelize.transaction();

        try {
            const quota = await WeeklyQuota.findOne({
                where: { QuotaID: quotaId },
                include: [{ model: QuotaItems }]
            });

            if (!quota) {
                throw { status: 404, message: 'Quota not found' };
            }

            if (!quota.canBeUsed()) {
                throw { status: 400, message: 'Quota cannot be used' };
            }

            // Generate usage ID
            const usageId = await generateUsageId();

            // Create usage record
            const usage = await QuotaUsage.create({
                UsageID: usageId,
                QuotaID: quotaId,
                UsageDate: new Date(),
                BlastingReport: usageData.blastingReport,
                SafetyChecklist: usageData.safetyChecklist,
                WeatherConditions: usageData.weatherConditions,
                SupervisorName: usageData.supervisorName,
                Status: usageData.status,
                RecordedBy: userId
            }, { transaction });

            // Update quota items used quantities
            for (const item of usageData.items) {
                const quotaItem = quota.QuotaItems.find(
                    qi => qi.ExplosiveTypeID === item.explosiveTypeId
                );

                if (!quotaItem) {
                    throw { 
                        status: 400, 
                        message: `Invalid explosive type: ${item.explosiveTypeId}` 
                    };
                }

                const newUsedQuantity = Number(quotaItem.UsedQuantity) + Number(item.quantity);

                if (newUsedQuantity > quotaItem.ApprovedQuantity) {
                    throw { 
                        status: 400, 
                        message: 'Usage exceeds approved quantity' 
                    };
                }

                await quotaItem.update({
                    UsedQuantity: newUsedQuantity
                }, { transaction });
            }

            // Check if all quantities are used
            const allUsed = quota.QuotaItems.every(
                item => item.UsedQuantity >= item.ApprovedQuantity
            );

            if (allUsed) {
                await quota.update({
                    Status: 'Used'
                }, { transaction });
            }

            await transaction.commit();

            return await this.getQuotaDetails(quotaId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

   /**
     * Get quota details
     */
   async getQuotaDetails(quotaId) {
    try {
        return await WeeklyQuota.findOne({
            where: { QuotaID: quotaId },
            include: [
                {
                    model: QuotaItems,
                    include: [{ model: ExplosiveType }]
                },
                {
                    model: ExplosivePermit,
                    attributes: ['PermitNumber', 'Status']
                },
                {
                    model: QuotaHistory,
                    limit: 10,
                    order: [['CreatedAt', 'DESC']]
                },
                {
                    model: QuotaUsage,
                    order: [['CreatedAt', 'DESC']]
                }
            ]
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Get quotas by permit
 */
async getPermitQuotas(permitId, filters = {}) {
    try {
        const whereClause = { PermitID: permitId };
        
        if (filters.status) {
            whereClause.Status = filters.status;
        }

        if (filters.startDate && filters.endDate) {
            whereClause.RequestDate = {
                [Op.between]: [filters.startDate, filters.endDate]
            };
        }

        return await WeeklyQuota.findAll({
            where: whereClause,
            include: [
                {
                    model: QuotaItems,
                    include: [{ model: ExplosiveType }]
                }
            ],
            order: [['RequestDate', 'DESC']]
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Get pending quotas for controller
 */
async getPendingQuotas(controllerId) {
    try {
        return await WeeklyQuota.findAll({
            where: { 
                Status: 'Pending'
            },
            include: [
                {
                    model: ExplosivePermit,
                    where: { ControllerID: controllerId }
                },
                {
                    model: QuotaItems,
                    include: [{ model: ExplosiveType }]
                }
            ],
            order: [['RequestDate', 'ASC']]
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Get quota usage history
 */
async getQuotaUsageHistory(quotaId) {
    try {
        return await QuotaUsage.findAll({
            where: { QuotaID: quotaId },
            order: [['UsageDate', 'DESC']]
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Check expiring quotas
 */
/*async checkExpiringQuotas() {
    try {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24); // Check quotas expiring in 24 hours

        return await WeeklyQuota.findAll({
            where: {
                Status: 'Approved',
                ExpiryDate: {
                    [Op.lte]: expiryDate,
                    [Op.gt]: new Date()
                }
            },
            include: [
                { model: ExplosivePermit },
                {
                    model: QuotaItems,
                    include: [{ model: ExplosiveType }]
                }
            ]
        });



    } catch (error) {
        throw error;
    }
}*/

  // For scheduled quota expiry checks
  /*async checkExpiringQuotas() {
    try {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24); // Check quotas expiring in 24 hours

        const expiringQuotas = await WeeklyQuota.findAll({
            where: {
                Status: 'Approved',
                ExpiryDate: {
                    [Op.lte]: expiryDate,
                    [Op.gt]: new Date()
                }
            },
            include: [
                { model: ExplosivePermit },
                {
                    model: QuotaItems,
                    include: [{ model: ExplosiveType }]
                }
            ]
        });

        if (expiringQuotas.length > 0) {
            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.QUOTA_EXPIRY,
                title: 'Quota Expiry Notice',
                message: `${expiringQuotas.length} quotas are expiring soon`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'QUOTA',
                recipients: await this.getQuotaRecipients(expiringQuotas[0]),
                emailTemplate: 'QUOTA_EXPIRY',
                emailData: {
                    quotas: expiringQuotas.map(quota => ({
                        quotaId: quota.QuotaID,
                        permitNumber: quota.ExplosivePermit.PermitNumber,
                        expiryDate: quota.ExpiryDate,
                        items: quota.QuotaItems.map(item => ({
                            explosiveType: item.ExplosiveType.TypeName,
                            approvedQuantity: item.ApprovedQuantity,
                            remainingQuantity: item.ApprovedQuantity - item.UsedQuantity,
                            unit: item.Unit
                        }))
                    }))
                }
            });
        }

        return expiringQuotas;
    } catch (error) {
        throw error;
    }}*/

// For checking expiring quotas
async checkExpiringQuotas() {
    try {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 24);

        const expiringQuotas = await WeeklyQuota.findAll({
            where: {
                Status: 'Approved',
                ExpiryDate: {
                    [Op.lte]: expiryDate,
                    [Op.gt]: new Date()
                }
            },
            include: [
                { model: ExplosivePermit },
                { model: QuotaItems, include: [ExplosiveType] }
            ]
        });

        if (expiringQuotas.length > 0) {
            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.QUOTA_EXPIRY,
                title: 'Quota Expiry Notice',
                message: `${expiringQuotas.length} quotas expiring soon`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'QUOTA',
                recipients: await recipientService.getPermitRecipients(expiringQuotas[0].PermitID),
                emailTemplate: 'QUOTA_EXPIRY',
                emailData: {
                    quotas: expiringQuotas.map(quota => ({
                        quotaId: quota.QuotaID,
                        expiryDate: quota.ExpiryDate,
                        permitNumber: quota.ExplosivePermit.PermitNumber,
                        items: quota.QuotaItems.map(item => ({
                            explosiveType: item.ExplosiveType.TypeName,
                            approvedQuantity: item.ApprovedQuantity,
                            remainingQuantity: item.ApprovedQuantity - (item.UsedQuantity || 0)
                        }))
                    }))
                }
            });
        }

        return expiringQuotas;
    } catch (error) {
        throw error;
    }
}

/**
 * Cancel quota request
 */
async cancelQuota(quotaId, reason, userId) {
    const transaction = await sequelize.transaction();

    try {
        const quota = await WeeklyQuota.findByPk(quotaId);
        if (!quota) {
            throw { status: 404, message: 'Quota not found' };
        }

        if (!['Pending', 'Approved'].includes(quota.Status)) {
            throw { 
                status: 400, 
                message: 'Can only cancel pending or approved quotas' 
            };
        }

        const previousStatus = quota.Status;

        // Update quota status
        await quota.update({
            Status: 'Cancelled',
            RejectionReason: reason
        }, { transaction });

        // Create history record
        const historyId = await generateHistoryId();
        await QuotaHistory.create({
            HistoryID: historyId,
            QuotaID: quotaId,
            ChangeType: 'StatusChanged',
            PreviousStatus: previousStatus,
            NewStatus: 'Cancelled',
            ChangedBy: userId,
            Remarks: reason
        }, { transaction });

        await transaction.commit();

        return await this.getQuotaDetails(quotaId);
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async calculateQuotaQuantities(permitId, validityPeriod) {
    const permit = await ExplosivePermit.findOne({
        where: { PermitID: permitId },
        include: [PermitAllowedExplosive]
    });

    return permit.PermitAllowedExplosives.map(allowed => ({
        explosiveTypeId: allowed.ExplosiveTypeID,
        //calculatedQuantity: Math.floor((allowed.RemainingQuantity * validityPeriod) / permit.ValidityPeriod),
        calculatedQuantity: Math.floor((allowed.AllowedQuantity * validityPeriod) / permit.ValidityPeriod),
        unit: allowed.Unit
    }));
}

/**
 * Generate quota summary report
 */
async generateQuotaSummary(permitId, startDate, endDate) {
    try {
        const quotas = await WeeklyQuota.findAll({
            where: {
                PermitID: permitId,
                RequestDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: QuotaItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: QuotaUsage }
            ]
        });

        // Calculate summary statistics
        const summary = {
            totalQuotas: quotas.length,
            byStatus: {},
            explosiveUsage: {},
            utilizationRate: 0
        };

        quotas.forEach(quota => {
            // Count by status
            summary.byStatus[quota.Status] = (summary.byStatus[quota.Status] || 0) + 1;

            // Calculate explosive usage
            quota.QuotaItems.forEach(item => {
                const type = item.ExplosiveType.TypeName;
                if (!summary.explosiveUsage[type]) {
                    summary.explosiveUsage[type] = {
                        requested: 0,
                        approved: 0,
                        used: 0
                    };
                }
                summary.explosiveUsage[type].requested += Number(item.RequestedQuantity);
                summary.explosiveUsage[type].approved += Number(item.ApprovedQuantity || 0);
                summary.explosiveUsage[type].used += Number(item.UsedQuantity);
            });
        });

        // Calculate utilization rate
        for (const type in summary.explosiveUsage) {
            const usage = summary.explosiveUsage[type];
            usage.utilizationRate = usage.approved ? 
                (usage.used / usage.approved * 100).toFixed(2) : 0;
        }

        return summary;
    } catch (error) {
        throw error;
    }
}

// Private methods
async validateRequestedQuantities(items, permit) {
    for (const item of items) {
        const allowedExplosive = permit.PermitAllowedExplosives.find(
            pae => pae.ExplosiveTypeID === item.explosiveTypeId
        );

        if (!allowedExplosive) {
            throw { 
                status: 400, 
                message: `Explosive type ${item.explosiveTypeId} not allowed in permit` 
            };
        }

        if (item.quantity > allowedExplosive.RemainingQuantity) {
            throw { 
                status: 400, 
                message: `Requested quantity exceeds remaining permit quantity for ${allowedExplosive.ExplosiveType.TypeName}` 
            };
        }
    }
}

calculateExpiryDate(validityPeriod) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + validityPeriod);
    return expiryDate;
}

async notifyController(quota, type) {
    try {
        const permit = await ExplosivePermit.findByPk(quota.PermitID, {
            include: [{ model: ExplosiveController }]
        });

        const emailContent = this.generateEmailContent(type, {
            quota,
            permit,
            controller: permit.ExplosiveController
        });

        await sendEmail({
            to: permit.ExplosiveController.Email,
            subject: emailContent.subject,
            html: emailContent.body
        });
    } catch (error) {
        console.error('Notification error:', error);
    }
}

async notifyStatusChange(quota, status) {
    try {
        const permit = await ExplosivePermit.findByPk(quota.PermitID, {
            include: [{ model: MiningSite }]
        });

        const emailContent = this.generateStatusEmailContent(status, {
            quota,
            permit,
            miningSite: permit.MiningSite
        });

        await sendEmail({
            to: permit.MiningSite.ContactEmail,
            subject: emailContent.subject,
            html: emailContent.body
        });
    } catch (error) {
        console.error('Status notification error:', error);
    }
}

generateEmailContent(type, data) {
    const templates = {
        new_request: {
            subject: `New Quota Request - ${data.permit.PermitNumber}`,
            body: `
                <h2>New Quota Request</h2>
                <p>A new quota request has been submitted:</p>
                <ul>
                    <li>Permit: ${data.permit.PermitNumber}</li>
                    <li>Request Date: ${data.quota.RequestDate}</li>
                    <li>Planned Usage: ${data.quota.PlannedUsageDate}</li>
                </ul>
            `
        }
        // Add more email templates as needed
    };

    return templates[type];
}


async validateQuotaData(data) {
    try {
        console.log('Service: Starting quota validation for:', data);
        const errors = [];

        // Basic field validations
        if (!data.permitId) {
            errors.push('Permit ID is required');
        }

        if (!data.plannedUsageDate) {
            errors.push('Planned usage date is required');
        } else {
            const plannedDate = new Date(data.plannedUsageDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time component for date comparison
            if (plannedDate < today) {
                errors.push('Planned usage date cannot be in the past');
            }
        }

        if (!data.purpose?.trim()) {
            errors.push('Purpose is required');
        }

        if (!data.blastingLocation?.trim()) {
            errors.push('Blasting location is required');
        }

        if (!data.blastingTime?.trim()) {
            errors.push('Blasting time is required');
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (data.blastingTime && !timeRegex.test(data.blastingTime)) {
            errors.push('Invalid blasting time format. Use HH:mm format');
        }

        if (!data.safetyMeasures?.trim()) {
            errors.push('Safety measures are required');
        }

        // If basic validation fails, return early
        if (errors.length > 0) {
            return errors;
        }

        // Validate permit and quota
        const permitValidation = await this.validatePermitAndQuota(
            data.permitId,
            data.validityPeriod
        );
        
        if (permitValidation.errors.length > 0) {
            errors.push(...permitValidation.errors);
        }

        console.log('Service: Validation completed with errors:', errors);
        return errors;

    } catch (error) {
        console.error('Service: Error in validateQuotaData:', error);
        throw {
            status: 500,
            message: error.message || 'Internal server error during validation'
        };
    }
}

async validatePermitAndQuota(permitId, validityPeriod) {
    try {
        const errors = [];
        console.log('Service: Validating permit:', permitId, 'validity period:', validityPeriod);

        const permit = await ExplosivePermit.findOne({
            where: {
                PermitID: permitId,
                Status: 'Active',
                ExpiryDate: {
                    [Op.gt]: new Date()
                }
            },
            include: [{
                model: PermitAllowedExplosive,
                include: [ExplosiveType]
            }]
        });

        if (!permit) {
            errors.push('Invalid or expired permit');
            return { permit: null, errors };
        }

        // Check existing active quota
        const existingQuota = await WeeklyQuota.findOne({
            where: {
                PermitID: permitId,
                Status: {
                    [Op.in]: ['Pending', 'Approved']
                },
                ExpiryDate: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (existingQuota) {
            errors.push('Active quota already exists for this permit');
            return { permit, errors };
        }

        // Check explosives availability
        if (!permit.PermitAllowedExplosives?.length) {
            errors.push('No explosive types allowed in permit');
            return { permit, errors };
        }

        permit.PermitAllowedExplosives.forEach(allowed => {
            if (allowed.RemainingQuantity <= 0) {
                errors.push(`No remaining quantity for ${allowed.ExplosiveType.TypeName}`);
                return;
            }

            const calculatedQuota = Math.floor(
                (allowed.RemainingQuantity * validityPeriod) / permit.ValidityPeriod
            );

            if (calculatedQuota <= 0) {
                errors.push(
                    `Insufficient remaining quantity for ${allowed.ExplosiveType.TypeName} based on validity period`
                );
            }
        });

        return { permit, errors };

    } catch (error) {
        console.error('Service: Error in validatePermitAndQuota:', error);
        throw {
            status: 500,
            message: 'Error validating permit and quota'
        };
    }
}





}

module.exports = new WeeklyQuotaService();