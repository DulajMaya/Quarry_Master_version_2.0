// explosive-permit.service.js

const { 
    ExplosivePermit, 
    PermitAllowedExplosive, 
    PermitHistory, 
    PermitUsage,
    ExplosiveType,
    MiningSite,
    ExplosiveController
} = require('../models');
const { generatePermitId, generateAllowedId, generateHistoryId, generateUsageId , generateBulkUsageIds } = require('./id-generator.service');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email.util'); // just implement by chatGPT need to implement
const sequelize = require('../config/db.config'); // for const transaction needed
const notificationService = require('../notifications/services/notification.service');

class ExplosivePermitService {

    /**
     * Generate sequential AllowedIDs for multiple explosives within a transaction
     * @private
     */
    async generateBatchAllowedIds(count, transaction) {
        const lastAllowed = await PermitAllowedExplosive.findOne({
            order: [['AllowedID', 'DESC']],
            lock: true,
            transaction
        });

        const startNumber = lastAllowed 
            ? parseInt(lastAllowed.AllowedID.slice(3)) + 1 
            : 1;

        return Array.from({ length: count }, (_, index) => {
            const number = startNumber + index;
            return `PAE${number.toString().padStart(5, '0')}`;
        });
    }

    async  updatePermitPhoto(permitId, photoUrl) {
        try {
            const permit = await ExplosivePermit.findByPk(permitId);
            if (!permit) {
                throw { status: 404, message: 'Permit not found' };
            }
            
            await permit.update({ PermitPhotoURL: photoUrl });
            return permit;
        } catch (error) {
            console.error('Error updating permit photo:', error);
            throw error;
        }
    }










    /**
     * Create new explosive permit
     */
    /*async createPermit(permitData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Validate mining site and license
            const miningSite = await MiningSite.findByPk(permitData.miningSiteId);
            if (!miningSite) {
                throw { status: 404, message: 'Mining site not found' };
            }

            // Check for active permits
            const activePermit = await ExplosivePermit.findOne({
                where: {
                    MiningSiteID: permitData.miningSiteId,
                    Status: 'Active',
                    ExpiryDate: {
                        [Op.gt]: new Date()
                    }
                }
            });

            if (activePermit) {
                throw { 
                    status: 400, 
                    message: 'Mining site already has an active permit' 
                };
            }

            // Generate permit ID and number
            const permitId = await generatePermitId();
            const permitNumber = this.generatePermitNumber(permitData.miningSiteId);

            // Create permit
            const permit = await ExplosivePermit.create({
                PermitID: permitId,
                PermitNumber: permitNumber,
                MiningSiteID: permitData.miningSiteId,
                LicenseID: permitData.licenseId,
                ControllerID: permitData.controllerId,
                IssueDate: new Date(),
                ExpiryDate: this.calculateExpiryDate(permitData.validityPeriod),
                Purpose: permitData.purpose,
                Status: 'Pending',
                ValidityPeriod: permitData.validityPeriod,
                Remarks: permitData.remarks,
                CreatedBy: userId
            }, { transaction });



            // Generate all AllowedIDs at once
            const allowedIds = await this.generateBatchAllowedIds(permitData.explosives.length, transaction);

            // Create allowed explosives records
            const allowedExplosives = await Promise.all(permitData.explosives.map((explosive, index) => {
                return PermitAllowedExplosive.create({
                    AllowedID: allowedIds[index],
                    PermitID: permitId,
                    ExplosiveTypeID: explosive.explosiveTypeId,
                    AllowedQuantity: explosive.quantity,
                    RemainingQuantity: explosive.quantity,
                    Unit: explosive.unit
                }, { transaction });
            }));


            /*

            // Create allowed explosives records
            for (const explosive of permitData.explosives) {
                const allowedId = await generateAllowedId();
                await PermitAllowedExplosive.create({
                    AllowedID: allowedId,
                    PermitID: permitId,
                    ExplosiveTypeID: explosive.explosiveTypeId,
                    AllowedQuantity: explosive.quantity,
                    RemainingQuantity: explosive.quantity,
                    Unit: explosive.unit
                }, { transaction });
            }*/
           /*

            //Create history record later develop id generate make to be done as array otherwise duplicate
            const historyId = await generateHistoryId();
            await PermitHistory.create({
                HistoryID: historyId,
                PermitID: permitId,
                ChangeType: 'Created',
                NewStatus: 'Pending',
                ChangedBy: userId,
                Remarks: 'Initial permit creation'
            }, { transaction }); 

            

            // Send notification to controller
            //await this.notifyController(permit, 'new_permit');

            //return permit;

            //new notification system

            /*

            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PERMIT_STATUS,
                title: 'New Permit Application',
                message: `New permit application ${permit.PermitNumber} received`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PERMIT',
                referenceId: permit.PermitID,
                recipients: await notificationService.getRecipientsByRole(['EXPLOSIVE_CONTROLLER']),
                emailTemplate: 'PERMIT_STATUS',
                emailData: {
                    status: 'Created',
                    permitNumber: permit.PermitNumber,
                    miningSite: miningSite.SiteName,
                    issueDate: permit.IssueDate,
                    purpose: permit.Purpose
                }
            });*/

            /*await transaction.commit();
            console.log(userId)

            // After creating permit, send notification
           // Send notification after successful commit
           await notificationService.sendPermitStatusNotification(
            null,  // No permitId for new permit
            'Created',
            {
                permitNumber: permit.PermitNumber,
                miningSite: miningSite.SiteName,
                issueDate: permit.IssueDate,
                purpose: permit.Purpose
            },
            userId,
            {
                controllerId: permitData.controllerId,
                miningSiteId: permitData.miningSiteId
            }
        );

            

            return {
                ...permit.toJSON(),
                allowedExplosives: allowedExplosives.map(ae => ae.toJSON())
            };
            



        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/


        async createPermit(permitData, userId) {
            const transaction = await sequelize.transaction();
            
            try {
                // Validate mining site and license
                const miningSite = await MiningSite.findByPk(permitData.miningSiteId);
                if (!miningSite) {
                    throw { status: 404, message: 'Mining site not found' };
                }
        
                // Check for active permits
                const activePermit = await ExplosivePermit.findOne({
                    where: {
                        MiningSiteID: permitData.miningSiteId,
                        Status: 'Active',
                        ExpiryDate: {
                            [Op.gt]: new Date()
                        }
                    }
                });
        
                if (activePermit) {
                    throw { 
                        status: 400, 
                        message: 'Mining site already has an active permit' 
                    };
                }
        
                // Generate permit ID and number
                const permitId = await generatePermitId();
                const permitNumber = this.generatePermitNumber(permitData.miningSiteId);
        
                // Create permit with initial Pending status
                const permit = await ExplosivePermit.create({
                    PermitID: permitId,
                    PermitNumber: permitNumber,
                    MiningSiteID: permitData.miningSiteId,
                    LicenseID: permitData.licenseId,
                    ControllerID: permitData.controllerId,
                    IssueDate: new Date(),
                    ExpiryDate: this.calculateExpiryDate(permitData.validityPeriod),
                    Purpose: permitData.purpose,
                    Status: 'Pending',
                    ValidityPeriod: permitData.validityPeriod,
                    Remarks: permitData.remarks,
                    CreatedBy: userId
                }, { transaction });
        
                // Generate all AllowedIDs at once
                const allowedIds = await this.generateBatchAllowedIds(permitData.explosives.length, transaction);
        
                // Create allowed explosives records
                const allowedExplosives = await Promise.all(permitData.explosives.map((explosive, index) => {
                    return PermitAllowedExplosive.create({
                        AllowedID: allowedIds[index],
                        PermitID: permitId,
                        ExplosiveTypeID: explosive.explosiveTypeId,
                        AllowedQuantity: explosive.quantity,
                        RemainingQuantity: explosive.quantity,
                        Unit: explosive.unit
                    }, { transaction });
                }));
        
                // Create initial history record
                const historyId = await generateHistoryId();
                await PermitHistory.create({
                    HistoryID: historyId,
                    PermitID: permitId,
                    ChangeType: 'Created',
                    NewStatus: 'Pending',
                    ChangedBy: userId,
                    Remarks: 'Initial permit request'
                }, { transaction });
        
                await transaction.commit();
        
                // Send notification after successful commit
                await notificationService.sendPermitStatusNotification(
                    null,
                    'Created',
                    {
                        permitNumber: permit.PermitNumber,
                        miningSite: miningSite.SiteName,
                        issueDate: permit.IssueDate,
                        purpose: permit.Purpose
                    },
                    userId,
                    {
                        controllerId: permitData.controllerId,
                        miningSiteId: permitData.miningSiteId
                    }
                );
        
                return {
                    ...permit.toJSON(),
                    allowedExplosives: allowedExplosives.map(ae => ae.toJSON())
                };
        
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }

    /**
     * Update permit status
     */
    /*
    async updatePermitStatus(permitId, status, remarks, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const permit = await ExplosivePermit.findByPk(permitId);
            if (!permit) {
                throw { status: 404, message: 'Permit not found' };
            }

            const previousStatus = permit.Status;
            const historyId = await generateHistoryId();

            // Update permit
            await permit.update({
                Status: status,
                ApprovalDate: status === 'Active' ? new Date() : null,
                ApprovedBy: status === 'Active' ? userId : null,
                RejectionReason: status === 'Rejected' ? remarks : null
            }, { transaction });

            // Create history record
            await PermitHistory.create({
                HistoryID: historyId,
                PermitID: permitId,
                ChangeType: 'StatusChanged',
                PreviousStatus: previousStatus,
                NewStatus: status,
                ChangedBy: userId,
                Remarks: remarks
            }, { transaction });



            await notificationService.sendPermitStatusNotification(
                permitId,
                status,
                {
                    permitNumber: permit.PermitNumber,
                    status: status,
                    remarks: remarks,
                    approvalDate: status === 'Active' ? new Date() : null,
                    approvedBy: status === 'Active' ? userId : null,
                    rejectionReason: status === 'Rejected' ? remarks : null
                }
            );

            await transaction.commit();


            // Send notifications
            //await this.notifyStatusChange(permit, status);
            //new notification system

            /*await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PERMIT_STATUS,
                title: `Permit ${status}`,
                message: `Permit ${permit.PermitNumber} has been ${status.toLowerCase()}`,
                priority: status === 'Rejected' ? NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PERMIT',
                referenceId: permitId,
                recipients: await notificationService.getRecipientsByRole([
                    'SITE_ENGINEER',
                    'EXPLOSIVE_CONTROLLER'
                ]),
                emailTemplate: 'PERMIT_STATUS',
                emailData: {
                    status,
                    permitNumber: permit.PermitNumber,
                    remarks,
                    approvalDate: status === 'Active' ? permit.ApprovalDate : null,
                    approver: status === 'Active' ? approverName : null
                }
            });



            return permit;
        } catch (error) {
            console.log(error)
            await transaction.rollback();
            throw error;
        }
    }*/



        /*async updatePermitStatus(permitId, status, remarks, userId) {
            const transaction = await sequelize.transaction();
            
            try {
                const permit = await ExplosivePermit.findByPk(permitId, {
                    include: [{ model: MiningSite,
                                as : "miningSites"
                     }]
                });
                if (!permit) {
                    throw { status: 404, message: 'Permit not found' };
                }
        
                const previousStatus = permit.Status;
                const historyId = await generateHistoryId();
        
                // Update permit
                await permit.update({
                    Status: status,
                    ApprovalDate: status === 'Active' ? new Date() : null,
                    ApprovedBy: status === 'Active' ? userId : null,
                    RejectionReason: status === 'Rejected' ? remarks : null
                }, { transaction });
        
                // Create history record
                await PermitHistory.create({
                    HistoryID: historyId,
                    PermitID: permitId,
                    ChangeType: 'StatusChanged',
                    PreviousStatus: previousStatus,
                    NewStatus: status,
                    ChangedBy: userId,
                    Remarks: remarks
                }, { transaction });
        
                await transaction.commit();
        
                // Send notification after commit
                await notificationService.sendPermitStatusNotification(
                    permitId,
                    status,
                    {
                        permitNumber: permit.PermitNumber,
                        miningSite: permit.miningSites.site_name,
                        status: status,
                        remarks: remarks,
                        issueDate: permit.IssueDate,
                        purpose: permit.Purpose,
                        validityPeriod: permit.ValidityPeriod
                    },
                    userId
                );
        
                return permit;
            } catch (error) {
                if (!transaction.finished) {
                    await transaction.rollback();
                }
                throw error;
            }
        }*/



            async updatePermitStatus(permitId, status, remarks, photoUrl, userId) {
                const transaction = await sequelize.transaction();
                
                try {
                    const permit = await ExplosivePermit.findByPk(permitId, {
                        include: [{ 
                            model: MiningSite,
                            as: "miningSites"
                        }]
                    });
            
                    if (!permit) {
                        throw { status: 404, message: 'Permit not found' };
                    }
            
                    // Validate photo requirement for approval
                    if (status === 'Active' && !photoUrl) {
                        throw { status: 400, message: 'Permit photo is required for approval' };
                    }
            
                    const previousStatus = permit.Status;
                    const historyId = await generateHistoryId();
            
                    // Update permit with status and photo
                    await permit.update({
                        Status: status,
                        PermitPhotoURL: photoUrl, // Add photo URL only during approval
                        ApprovalDate: status === 'Active' ? new Date() : null,
                        ApprovedBy: status === 'Active' ? userId : null,
                        RejectionReason: status === 'Rejected' ? remarks : null
                    }, { transaction });
            
                    // Create history record
                    await PermitHistory.create({
                        HistoryID: historyId,
                        PermitID: permitId,
                        ChangeType: 'StatusChanged',
                        PreviousStatus: previousStatus,
                        NewStatus: status,
                        ChangedBy: userId,
                        Remarks: remarks
                    }, { transaction });
            
                    await transaction.commit();
            
                    // Send notification after commit
                    await notificationService.sendPermitStatusNotification(
                        permitId,
                        status,
                        {
                            permitNumber: permit.PermitNumber,
                            miningSite: permit.miningSites.site_name,
                            status: status,
                            remarks: remarks,
                            issueDate: permit.IssueDate,
                            purpose: permit.Purpose,
                            validityPeriod: permit.ValidityPeriod
                        },
                        userId
                    );
            
                    return permit;
                } catch (error) {
                    if (!transaction.finished) {
                        await transaction.rollback();
                    }
                    throw error;
                }
            }

    /**
     * Update remaining quantities
     */
    /*async updateRemainingQuantities(permitId, quotaId, usageData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const permit = await ExplosivePermit.findByPk(permitId);
            if (!permit) {
                throw { status: 404, message: 'Permit not found' };
            }

            if (!permit.canBeUsed()) {
                throw { status: 400, message: 'Permit cannot be used' };
            }

            for (const usage of usageData) {
                const allowedExplosive = await PermitAllowedExplosive.findOne({
                    where: {
                        PermitID: permitId,
                        ExplosiveTypeID: usage.explosiveTypeId
                    },
                    transaction
                });

                if (!allowedExplosive) {
                    throw { 
                        status: 400, 
                        message: `Explosive type ${usage.explosiveTypeId} not allowed in permit` 
                    };
                }

                if (usage.quantity > allowedExplosive.RemainingQuantity) {
                    throw { 
                        status: 400, 
                        message: `Insufficient remaining quantity for explosive type ${usage.explosiveTypeId}` 
                    };
                }

                const newRemaining = Number(allowedExplosive.RemainingQuantity) - Number(usage.quantity);

                // Update remaining quantity
                await allowedExplosive.update({
                    RemainingQuantity: newRemaining,
                    LastUpdated: new Date()
                }, { transaction });

                // Record usage
                const usageId = await generateUsageId();
                await PermitUsage.create({
                    UsageID: usageId,
                    PermitID: permitId,
                    QuotaID: quotaId,
                    ExplosiveTypeID: usage.explosiveTypeId,
                    UsedQuantity: usage.quantity,
                    PreviousRemaining: allowedExplosive.RemainingQuantity,
                    NewRemaining: newRemaining,
                    RecordedBy: userId
                }, { transaction });
            }

            // Update permit last usage date
            await permit.update({
                LastUsageDate: new Date()
            }, { transaction });

            await transaction.commit();

            return await this.getPermitDetails(permitId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/




        /*async updateRemainingQuantities(permitId, quotaItems, userId) {
            const transaction = await sequelize.transaction();
            
            try {
                const permit = await ExplosivePermit.findByPk(permitId);
                if (!permit || !permit.canBeUsed()) {
                    throw { status: 400, message: 'Invalid or unusable permit' };
                }
        
                for (const quotaItem of quotaItems) {
                    const allowedExplosive = await PermitAllowedExplosive.findOne({
                        where: {
                            PermitID: permitId,
                            ExplosiveTypeID: quotaItem.ExplosiveTypeID
                        },
                        transaction
                    });
        
                    if (!allowedExplosive) {
                        throw { status: 400, message: `Explosive type not allowed in permit` };
                    }
        
                    const newRemaining = Number(allowedExplosive.RemainingQuantity) - Number(quotaItem.CalculatedQuantity);
        
                    await allowedExplosive.update({
                        RemainingQuantity: newRemaining,
                        LastUpdated: new Date()
                    }, { transaction });
        
                    await PermitUsage.create({
                        UsageID: await generateUsageId(),
                        PermitID: permitId,
                        QuotaID: quotaItem.QuotaID,
                        ExplosiveTypeID: quotaItem.ExplosiveTypeID,
                        UsedQuantity: quotaItem.CalculatedQuantity,
                        PreviousRemaining: allowedExplosive.RemainingQuantity,
                        NewRemaining: newRemaining,
                        RecordedBy: userId
                    }, { transaction });
                }
        
                await permit.update({ LastUsageDate: new Date() }, { transaction });
                await transaction.commit();
                
                return await this.getPermitDetails(permitId);
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }*/




            async  generateBulkUsageIds(count) {
                try {
                    // Find the last permit usage record
                    const lastUsage = await PermitUsage.findOne({
                        order: [['UsageID', 'DESC']]
                    });
            
                    // Get the starting number
                    const startNumber = lastUsage 
                        ? parseInt(lastUsage.UsageID.slice(3)) + 1 
                        : 1;
            
                    // Generate array of sequential IDs
                    const usageIds = Array.from({ length: count }, (_, index) => {
                        const nextNumber = startNumber + index;
                        if (nextNumber > 99999) {
                            throw new Error('UsageID sequence has reached its maximum value');
                        }
                        return `PUS${nextNumber.toString().padStart(5, '0')}`;
                    });
            
                    return usageIds;
                } catch (error) {
                    console.error('Error generating bulk Usage IDs:', error);
                    throw error;
                }
            }
            
            async  updateRemainingQuantities(permitId, quotaItems, userId) {
                const transaction = await sequelize.transaction();
            
                try {
                    // Validate permit
                    const permit = await ExplosivePermit.findByPk(permitId);
                    if (!permit || !permit.canBeUsed()) {
                        throw { status: 400, message: 'Invalid or unusable permit' };
                    }
            
                    // Generate all needed usage IDs upfront
                    const usageIds = await this.generateBulkUsageIds(quotaItems.length);
                    
            
                    // Process each quota item with pre-generated IDs
                    for (let i = 0; i < quotaItems.length; i++) {
                        const quotaItem = quotaItems[i];
                        const usageId = usageIds[i];
            
                        const allowedExplosive = await PermitAllowedExplosive.findOne({
                            where: {
                                PermitID: permitId,
                                ExplosiveTypeID: quotaItem.ExplosiveTypeID
                            },
                            transaction
                        });
            
                        if (!allowedExplosive) {
                            throw { status: 400, message: `Explosive type not allowed in permit` };
                        }
            
                        const newRemaining = Number(allowedExplosive.RemainingQuantity) - Number(quotaItem.CalculatedQuantity);
            
                        // Update allowed explosive
                        await allowedExplosive.update({
                            RemainingQuantity: newRemaining,
                            LastUpdated: new Date()
                        }, { transaction });
            
                        // Create permit usage with pre-generated ID
                        await PermitUsage.create({
                            UsageID: usageId,
                            PermitID: permitId,
                            QuotaID: quotaItem.QuotaID,
                            ExplosiveTypeID: quotaItem.ExplosiveTypeID,
                            UsedQuantity: quotaItem.CalculatedQuantity,
                            PreviousRemaining: allowedExplosive.RemainingQuantity,
                            NewRemaining: newRemaining,
                            RecordedBy: userId
                        }, { transaction });
                    }
            
                    // Update permit last usage date
                    await permit.update({ LastUsageDate: new Date() }, { transaction });
                    
                    // Commit transaction
                    await transaction.commit();
            
                    return await this.getPermitDetails(permitId);
                } catch (error) {
                    await transaction.rollback();
                    throw error;
                }
            }


    // In explosive-permit.service.js
/*async updatePermitRemainingQuantities(permitId, quotaItems, transaction) {
    const permit = await ExplosivePermit.findOne({
        where: { PermitID: permitId },
        include: [PermitAllowedExplosive],
        transaction
    });
 
    for (const quotaItem of quotaItems) {
        const permitExplosive = permit.PermitAllowedExplosives.find(
            pae => pae.ExplosiveTypeID === quotaItem.ExplosiveTypeID
        );
        
        // Subtract calculated quota amount from permit remaining
        const newRemaining = permitExplosive.RemainingQuantity - quotaItem.CalculatedQuantity;
        await allowedExplosive.update({
            RemainingQuantity: newRemaining,
            LastUpdated: new Date()
        }, { transaction });
    }
 }/*


    /**
     * Get permit details with all related information
     */
    async getPermitDetails(permitId) {
        try {
            return await ExplosivePermit.findOne({
                where: { PermitID: permitId },
                include: [
                    {
                        model: PermitAllowedExplosive,
                        include: [{ model: ExplosiveType }]
                    },
                    { model: MiningSite, as : 'miningSites' },
                    { model: ExplosiveController },
                    {
                        model: PermitHistory,
                        limit: 10,
                        order: [['CreatedAt', 'DESC']]
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get permits by mining site
     */
    async getMiningSitePermits(miningSiteId, status = null) {
        try {
            const whereClause = { MiningSiteID: miningSiteId };
            if (status) {
                whereClause.Status = status;
            }

            return await ExplosivePermit.findAll({
                where: whereClause,
                include: [
                    {
                        model: PermitAllowedExplosive,
                        include: [{ model: ExplosiveType }]
                    }
                ],
                order: [['CreatedAt', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    }



   /* async getControllerPermits(controllerId, status = null) {
        try {
            const whereClause = { 
                ControllerID: controllerId 
            };
            
            if (status) {
                whereClause.Status = status;
            }
    
            return await ExplosivePermit.findAll({
                where: whereClause,
                include: [
                    {
                        model: PermitAllowedExplosive,
                        include: [{ model: ExplosiveType }]
                    },
                    { 
                        model: MiningSite,
                        as: 'miningSites'
                    },
                    { 
                        model: ExplosiveController 
                    }
                ],
                order: [['CreatedAt', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    }*/

        // explosive-permit.service.js

async getControllerPermits(controllerId, status = null, pagination) {
    try {
        const whereClause = { 
            ControllerID: controllerId 
        };
        
        if (status) {
            whereClause.Status = status;
        }

        const { count, rows } = await ExplosivePermit.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: PermitAllowedExplosive,
                    include: [{ model: ExplosiveType }]
                },
                { 
                    model: MiningSite,
                    as: 'miningSites'
                },
                { 
                    model: ExplosiveController 
                }
            ],
            order: [['CreatedAt', 'DESC']],
            limit: pagination.limit,
            offset: (pagination.page - 1) * pagination.limit
        });

        return {
            permits: rows,
            total: count,
            totalPages: Math.ceil(count / pagination.limit)
        };
    } catch (error) {
        throw error;
    }
}




   
    /**
     * Get permit usage history
     */
    async getPermitUsageHistory(permitId) {
        try {
            return await PermitUsage.findAll({
                where: { PermitID: permitId },
                include: [
                    { model: ExplosiveType }
                ],
                order: [['UsageDate', 'DESC']]
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Check expiring permits
     */
    /*async checkExpiringPermits() {
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30); // Check permits expiring in 30 days

            return await ExplosivePermit.findAll({
                where: {
                    Status: 'Active',
                    ExpiryDate: {
                        [Op.lte]: expiryDate,
                        [Op.gt]: new Date()
                    }
                },
                include: [{ model: MiningSite }]
            });
        } catch (error) {
            throw error;
        }
    }*/
        /*
        async checkExpiringPermits() {
            try {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + 30); // Check permits expiring in 30 days
        
                const expiringPermits = await ExplosivePermit.findAll({
                    where: {
                        Status: 'Active',
                        ExpiryDate: {
                            [Op.lte]: expiryDate,
                            [Op.gt]: new Date()
                        }
                    },
                    include: [{ model: MiningSite }]
                });
        
                // Send notifications if there are expiring permits
                if (expiringPermits.length > 0) {
                    await notificationService.sendPermitExpiryNotice(
                        expiringPermits.map(permit => ({
                            permitNumber: permit.PermitNumber,
                            issueDate: permit.IssueDate,
                            expiryDate: permit.ExpiryDate,
                            miningSite: permit.MiningSite.SiteName,
                            daysRemaining: Math.ceil(
                                (new Date(permit.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                            ),
                            critical: Math.ceil(
                                (new Date(permit.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                            ) <= 7
                        }))
                    );
                }
        
                return expiringPermits;
            } catch (error) {
                throw error;
            }
        }*/



            async checkExpiringPermits() {
                try {
                    const expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() + 30);
        
                    const expiringPermits = await ExplosivePermit.findAll({
                        where: {
                            Status: 'Active',
                            ExpiryDate: {
                                [Op.lte]: expiryDate,
                                [Op.gt]: new Date()
                            }
                        },
                        include: [{ model: MiningSite }]
                    });
        
                    if (expiringPermits.length > 0) {
                        await notificationService.sendPermitExpiryNotice(
                            expiringPermits.map(permit => ({
                                permitId: permit.PermitID,
                                permitNumber: permit.PermitNumber,
                                issueDate: permit.IssueDate,
                                expiryDate: permit.ExpiryDate,
                                miningSite: permit.MiningSite.SiteName,
                                daysRemaining: Math.ceil(
                                    (new Date(permit.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                                ),
                                critical: Math.ceil(
                                    (new Date(permit.ExpiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                                ) <= 7
                            }))
                        );
                    }
        
                    return expiringPermits;
                } catch (error) {
                    throw error;
                }
            }

    // Utility methods
    generatePermitNumber(miningSiteId) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `PER/${miningSiteId}/${year}${month}/${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }

    calculateExpiryDate(validityPeriod) {
        const expiryDate = new Date();
        // Convert days to milliseconds and add to current date
        return new Date(expiryDate.getTime() + (validityPeriod * 24 * 60 * 60 * 1000));
    }

    async notifyController(permit, type) {
        try {
            const controller = await ExplosiveController.findByPk(permit.ControllerID);
            const miningSite = await MiningSite.findByPk(permit.MiningSiteID);

            const emailContent = this.generateEmailContent(type, {
                permit,
                controller,
                miningSite
            });

            await sendEmail({
                to: controller.Email,
                subject: emailContent.subject,
                html: emailContent.body
            });
        } catch (error) {
            console.error('Notification error:', error);
            // Don't throw error to prevent transaction rollback
        }
    }



    generateEmailContent(type, data) {
        const templates = {
            new_permit: {
                subject: `New Permit Application - ${data.miningSite.SiteName}`,
                body: `
                    <h2>New Permit Application</h2>
                    <p>A new permit application has been submitted:</p>
                    <ul>
                        <li>Mining Site: ${data.miningSite.SiteName}</li>
                        <li>Permit Number: ${data.permit.PermitNumber}</li>
                        <li>Submitted Date: ${data.permit.CreatedAt}</li>
                    </ul>
                `
            },
            // Add more email templates as needed
        };

        return templates[type];
    }
}

module.exports = new ExplosivePermitService();