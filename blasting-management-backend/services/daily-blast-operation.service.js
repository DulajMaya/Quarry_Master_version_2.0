// services/daily-blast-operation.service.js
/*const { 
    DailyBlastOperation, 
    DailyBlastExplosive, 
    MiningSite, 
    ExplosiveType,
    ExplosiveIssuance,
    InventoryMovement,
    StoreInventory
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class DailyBlastOperationService {
    async createDailyOperation(data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting daily blast operation creation:', {
                miningSiteId: data.miningSiteId,
                operationDate: data.operation_date
            });

            // Check for existing operation on same date
            const existingOperation = await DailyBlastOperation.findOne({
                where: {
                    miningSiteId: data.miningSiteId,
                    operation_date: data.operation_date,
                    is_active: true
                }
            });

            if (existingOperation) {
                throw new Error('Daily blast operation already exists for this date');
            }

            // Create daily operation
            const operation = await DailyBlastOperation.create({
                ...data,
                created_by: data.userId
            }, { transaction });

            // Create explosive records if provided
            if (data.explosives && data.explosives.length > 0) {
                await this.createExplosiveRecords(operation.daily_blast_id, data.explosives, data.userId, transaction);
            }

            await transaction.commit();
            console.log('Successfully created daily blast operation:', {
                dailyBlastId: operation.daily_blast_id
            });

            return operation;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in createDailyOperation:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async createExplosiveRecords(dailyBlastId, explosives, userId, transaction) {
        try {
            // Create explosive records
            const explosiveRecords = await Promise.all(explosives.map(explosive => 
                DailyBlastExplosive.create({
                    daily_blast_id: dailyBlastId,
                    explosive_type_id: explosive.explosive_type_id,
                    explosive_issuance_id: explosive.explosive_issuance_id,
                    quantity_issued: explosive.quantity_issued,
                    created_by: userId
                }, { transaction })
            ));

            // Create inventory movements for issued explosives
            await Promise.all(explosiveRecords.map(record =>
                InventoryMovement.create({
                    InventoryID: record.explosive_type_id,
                    MovementType: 'OUT',
                    Quantity: record.quantity_issued,
                    ReferenceType: 'Blasting',
                    ReferenceID: record.daily_blast_explosive_id,
                    CreatedBy: userId
                }, { transaction })
            ));

            return explosiveRecords;
        } catch (error) {
            console.error('Error creating explosive records:', error);
            throw error;
        }
    }

    async getDailyOperations(miningSiteId, query = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                startDate,
                endDate,
                search
            } = query;

            const where = { 
                miningSiteId,
                is_active: true 
            };

            if (status) {
                where.status = status;
            }

            if (startDate && endDate) {
                where.operation_date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            const operations = await DailyBlastOperation.findAndCountAll({
                where,
                include: [
                    {
                        model: MiningSite,
                        as: 'miningSite'
                    },
                    {
                        model: DailyBlastExplosive,
                        as: 'dailyBlastExplosives',
                        include: [
                            {
                                model: ExplosiveType,
                                as: 'explosiveType'
                            }
                        ]
                    }
                ],
                order: [['operation_date', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            return {
                total: operations.count,
                pages: Math.ceil(operations.count / limit),
                currentPage: parseInt(page),
                operations: operations.rows
            };
        } catch (error) {
            console.error('Error in getDailyOperations:', error);
            throw error;
        }
    }

    async updateDailyOperation(daily_blast_id, data) {
        const transaction = await sequelize.transaction();
        try {
            const operation = await DailyBlastOperation.findOne({
                where: { 
                    daily_blast_id,
                    is_active: true 
                }
            });

            if (!operation) {
                throw new Error('Daily blast operation not found');
            }

            // Validate status transition
            if (data.status && !this.isValidStatusTransition(operation.status, data.status)) {
                throw new Error(`Invalid status transition from ${operation.status} to ${data.status}`);
            }

            // Update operation details
            await operation.update(data, { transaction });

            // Handle explosive updates if provided
            if (data.explosives) {
                await this.handleExplosiveUpdates(operation, data.explosives, data.userId, transaction);
            }

            await transaction.commit();
            return operation;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateDailyOperation:', error);
            throw error;
        }
    }

    async handleExplosiveUpdates(operation, explosives, userId, transaction) {
        try {
            for (const explosive of explosives) {
                const record = await DailyBlastExplosive.findOne({
                    where: {
                        daily_blast_id: operation.daily_blast_id,
                        explosive_type_id: explosive.explosive_type_id
                    }
                });

                if (record) {
                    // Update existing record
                    await record.update({
                        quantity_used: explosive.quantity_used,
                        quantity_returned: explosive.quantity_returned,
                        status: this.calculateExplosiveStatus(explosive)
                    }, { transaction });

                    // Create return movement if applicable
                    if (explosive.quantity_returned > 0) {
                        await InventoryMovement.create({
                            InventoryID: explosive.explosive_type_id,
                            MovementType: 'IN',
                            Quantity: explosive.quantity_returned,
                            ReferenceType: 'Return',
                            ReferenceID: record.daily_blast_explosive_id,
                            CreatedBy: userId
                        }, { transaction });
                    }
                }
            }
        } catch (error) {
            console.error('Error handling explosive updates:', error);
            throw error;
        }
    }

    calculateExplosiveStatus(explosive) {
        const totalAccounted = parseFloat(explosive.quantity_used) + parseFloat(explosive.quantity_returned);
        const issued = parseFloat(explosive.quantity_issued);

        if (totalAccounted === 0) return 'ISSUED';
        if (totalAccounted < issued) return 'PARTIALLY_USED';
        if (totalAccounted === issued) return 'COMPLETED';
        
        throw new Error('Total quantity used and returned exceeds issued amount');
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['ONGOING'],
            'ONGOING': ['COMPLETED'],
            'COMPLETED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }

    async getDailySummary(daily_blast_id) {
        try {
            const operation = await DailyBlastOperation.findOne({
                where: { daily_blast_id },
                include: [
                    {
                        model: DailyBlastExplosive,
                        as: 'dailyBlastExplosives',
                        include: [{ 
                            model: ExplosiveType,
                            as: 'explosiveType'
                        }]
                    }
                ]
            });

            if (!operation) {
                throw new Error('Daily blast operation not found');
            }

            // Calculate summaries
            const summary = {
                totalExplosivesIssued: operation.dailyBlastExplosives.reduce(
                    (acc, exp) => acc + parseFloat(exp.quantity_issued), 0
                ),
                totalExplosivesUsed: operation.dailyBlastExplosives.reduce(
                    (acc, exp) => acc + parseFloat(exp.quantity_used || 0), 0
                ),
                totalExplosivesReturned: operation.dailyBlastExplosives.reduce(
                    (acc, exp) => acc + parseFloat(exp.quantity_returned || 0), 0
                ),
                explosiveDetails: operation.dailyBlastExplosives.map(exp => ({
                    type: exp.explosiveType.TypeName,
                    issued: exp.quantity_issued,
                    used: exp.quantity_used || 0,
                    returned: exp.quantity_returned || 0,
                    status: exp.status
                }))
            };

            return summary;
        } catch (error) {
            console.error('Error in getDailySummary:', error);
            throw error;
        }
    }
}

module.exports = new DailyBlastOperationService();*/

// services/daily-blast-operation.service.js
const { 
    DailyBlastOperation,
    BlastEvent,
    ExplosiveIssuance,
    ExplosiveIssuanceItem,
    BlastEventExplosive,
    BlastHoleExplosive,
    MiningSite,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

class DailyBlastOperationService {
    async createDailyBlast(data) {
        const transaction = await sequelize.transaction();
        try {
            // Check if operation already exists for the date
            const existingOperation = await DailyBlastOperation.findOne({
                where: {
                    miningSiteId: data.miningSiteId,
                    operation_date: data.operation_date,
                    is_active: true
                }
            });

            if (existingOperation) {
                throw new Error('Daily blast operation already exists for this date');
            }

            // Validate mining site
            const site = await MiningSite.findByPk(data.miningSiteId);
            if (!site) {
                throw new Error('Mining site not found');
            }

            // Create daily blast operation
            const operation = await DailyBlastOperation.create({
                miningSiteId: data.miningSiteId,
                operation_date: data.operation_date,
                number_of_planned_blasts: data.number_of_planned_blasts,
                weather_conditions: data.weather_conditions,
                status: 'PLANNED',
                remarks: data.remarks,
                created_by: data.userId
            }, { transaction });

            await transaction.commit();
            return this.getDailyBlastDetails(operation.daily_blast_id);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /*async getDailyBlasts(miningSiteId, filters) {
        const { page, limit, status, startDate, endDate } = filters;

        const where = {
            miningSiteId,
            is_active: true
        };

        if (status) {
            where.status = status;
        }

        if (startDate && endDate) {
            where.operation_date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const { count, rows } = await DailyBlastOperation.findAndCountAll({
            where,
            include: [
                {
                    model: BlastEvent,
                    as: 'blastEvents',
                    attributes: ['blast_id', 'status'],
                    include: [{
                        model: BlastEventExplosive,
                        as: 'blastEventExplosives',
                        attributes: ['quantity_planned', 'quantity_used']
                    }]
                },
                {
                    model: ExplosiveIssuance,
                    as: 'explosiveIssuances',
                    include: [{
                        model: ExplosiveIssuanceItem,
                        attributes: ['explosive_type_id', 'quantity_issued', 'quantity_used', 'quantity_returned']
                    }]
                }
            ],
            order: [['operation_date', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        // Enhance operations with summary data
        const operations = rows.map(operation => ({
            ...operation.toJSON(),
            summary: this.calculateOperationSummary(operation)
        }));

        return {
            operations,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: page
        };
    }*/

    /*calculateOperationSummary(operation) {
        const completedBlasts = operation.blastEvents.filter(
            event => event.status === 'COMPLETED'
        ).length;

        const explosivesSummary = operation.explosiveIssuances.reduce((acc, issuance) => {
            issuance.ExplosiveIssuanceItem.forEach(item => {
                if (!acc[item.explosive_type_id]) {
                    acc[item.explosive_type_id] = {
                        issued: 0,
                        used: 0,
                        returned: 0
                    };
                }
                acc[item.explosive_type_id].issued += parseFloat(item.quantity_issued);
                acc[item.explosive_type_id].used += parseFloat(item.quantity_used || 0);
                acc[item.explosive_type_id].returned += parseFloat(item.quantity_returned || 0);
            });
            return acc;
        }, {});

        return {
            totalPlannedBlasts: operation.number_of_planned_blasts,
            completedBlasts,
            explosivesSummary
        };
    }*/




    // Fix for getDailyBlasts method
async getDailyBlasts(miningSiteId, filters) {
    const { page = 1, limit = 10, status, startDate, endDate } = filters;

    const where = {
        miningSiteId,
        is_active: true
    };

    if (status) {
        where.status = status;
    }

    if (startDate && endDate) {
        where.operation_date = {
            [Op.between]: [startDate, endDate]
        };
    }

    try {
        const { count, rows } = await DailyBlastOperation.findAndCountAll({
            where,
            include: [
                {
                    model: BlastEvent,
                    as: 'blastEvents',
                    attributes: ['blast_id', 'status'],
                    include: [{
                        model: BlastEventExplosive,
                        as: 'blastEventExplosives',
                        attributes: ['quantity_planned', 'quantity_used']
                    }]
                },
                {
                    model: ExplosiveIssuance,
                    as: 'explosiveIssuances',
                    include: [{
                        model: ExplosiveIssuanceItem,
                        as: 'ExplosiveIssuanceItems'  // Make sure this matches your model association
                    }]
                }
            ],
            order: [['operation_date', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        // Enhance operations with summary data
        const operations = rows.map(operation => {
            const operationData = operation.toJSON();
            return {
                ...operationData,
                summary: this.calculateOperationSummary(operationData)
            };
        });

        return {
            operations,
            total: count,
            pages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };

    } catch (error) {
        console.error('Error in getDailyBlasts:', error);
        throw error;
    }
}

// Fixed calculateOperationSummary method
calculateOperationSummary(operation) {
    try {
        const completedBlasts = operation.blastEvents?.filter(
            event => event.status === 'COMPLETED'
        ).length || 0;

        const explosivesSummary = {};
        
        // Safely process explosive issuances
        if (operation.explosiveIssuances && Array.isArray(operation.explosiveIssuances)) {
            operation.explosiveIssuances.forEach(issuance => {
                // Check if ExplosiveIssuanceItems exists and is an array
                const items = issuance.ExplosiveIssuanceItems || [];
                
                items.forEach(item => {
                    if (!explosivesSummary[item.explosive_type_id]) {
                        explosivesSummary[item.explosive_type_id] = {
                            issued: 0,
                            used: 0,
                            returned: 0
                        };
                    }
                    
                    explosivesSummary[item.explosive_type_id].issued += parseFloat(item.quantity_issued || 0);
                    explosivesSummary[item.explosive_type_id].used += parseFloat(item.quantity_used || 0);
                    explosivesSummary[item.explosive_type_id].returned += parseFloat(item.quantity_returned || 0);
                });
            });
        }

        return {
            totalPlannedBlasts: operation.number_of_planned_blasts || 0,
            completedBlasts,
            explosivesSummary
        };
    } catch (error) {
        console.error('Error in calculateOperationSummary:', error);
        // Return a default summary instead of throwing
        return {
            totalPlannedBlasts: operation.number_of_planned_blasts || 0,
            completedBlasts: 0,
            explosivesSummary: {}
        };
    }
}





    

    async getDailyBlastDetails(dailyBlastId) {
        /*const operation = await DailyBlastOperation.findOne({
            where: { 
                daily_blast_id: dailyBlastId,
                is_active: true
            },
            include: [
                {
                    model: MiningSite,
                    attributes: ['site_name', 'location']
                },
                {
                    model: BlastEvent,
                    include: [{
                        model: BlastEventExplosive,
                        include: ['explosiveType']
                    }]
                },
                {
                    model: ExplosiveIssuance,
                    include: [{
                        model: ExplosiveIssuanceItem,
                        include: ['explosiveType']
                    }]
                }
            ]
        });*/


        const operation = await DailyBlastOperation.findOne({
            where: { 
                daily_blast_id: dailyBlastId,
                is_active: true
            },
            include: [{
                model: MiningSite,
                as: 'miningSite',
                attributes: ['site_name', 'site_district']
            }, {
                model: BlastEvent,
                as: 'blastEvents',
                include: [{
                    model: BlastEventExplosive,
                    as: 'blastEventExplosives'
                }]
            }, {
                model: ExplosiveIssuance,
                as: 'explosiveIssuances',
                include: [{
                    model: ExplosiveIssuanceItem
                }]
            }]
        });

        if (!operation) {
            throw new Error('Daily blast operation not found');
        }

        // Add calculated fields and summaries
        const enhancedOperation = operation.toJSON();
        enhancedOperation.summary = this.calculateOperationSummary(operation);
        enhancedOperation.explosiveBalance = await this.calculateExplosiveBalance(dailyBlastId);

        return enhancedOperation;
    }

    async getExplosiveBalance(dailyBlastId) {
        const balance = await this.calculateExplosiveBalance(dailyBlastId);
        
        if (!balance) {
            throw new Error('Daily blast operation not found');
        }

        return balance;
    }

    async calculateExplosiveBalance(dailyBlastId) {
        const [issuances, usages] = await Promise.all([
            // Get all issuances
            ExplosiveIssuanceItem.findAll({
                include: [{
                    model: ExplosiveIssuance,
                    where: { daily_blast_id: dailyBlastId }
                }]
            }),
            // Get all actual usage from blast holes
            BlastHoleExplosive.findAll({
                include: [{
                    model: BlastHole,
                    include: [{
                        model: BlastEvent,
                        where: { daily_blast_id: dailyBlastId }
                    }]
                }]
            })
        ]);

        const balance = {};

        // Process issuances
        issuances.forEach(item => {
            if (!balance[item.explosive_type_id]) {
                balance[item.explosive_type_id] = {
                    issued: 0,
                    used: 0,
                    returned: 0,
                    remaining: 0
                };
            }
            balance[item.explosive_type_id].issued += parseFloat(item.quantity_issued);
            balance[item.explosive_type_id].returned += parseFloat(item.quantity_returned || 0);
        });

        // Process usages
        usages.forEach(usage => {
            if (!balance[usage.explosive_type_id]) {
                balance[usage.explosive_type_id] = {
                    issued: 0,
                    used: 0,
                    returned: 0,
                    remaining: 0
                };
            }
            balance[usage.explosive_type_id].used += parseFloat(usage.quantity);
        });

        // Calculate remaining
        Object.keys(balance).forEach(explosiveTypeId => {
            balance[explosiveTypeId].remaining = 
                balance[explosiveTypeId].issued - 
                balance[explosiveTypeId].used - 
                balance[explosiveTypeId].returned;
        });

        return balance;
    }

    async updateStatus(dailyBlastId, newStatus, userId) {
        const transaction = await sequelize.transaction();
        try {
            const operation = await DailyBlastOperation.findOne({
                where: { 
                    daily_blast_id: dailyBlastId,
                    is_active: true
                }
            });

            if (!operation) {
                throw new Error('Daily blast operation not found');
            }

            // Validate status transition
            if (!this.isValidStatusTransition(operation.status, newStatus)) {
                throw new Error(`Invalid status transition from ${operation.status} to ${newStatus}`);
            }

            // Additional validations based on status
            if (newStatus === 'COMPLETED') {
                await this.validateCompletion(dailyBlastId);
            }

            await operation.update({
                status: newStatus,
                updated_by: userId
            }, { transaction });

            await transaction.commit();
            return this.getDailyBlastDetails(dailyBlastId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['ONGOING'],
            'ONGOING': ['COMPLETED', 'CANCELLED'],
            'COMPLETED': [],
            'CANCELLED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }

    async validateCompletion(dailyBlastId) {
        // Check if all blasts are completed
        const incompleteBlasts = await BlastEvent.count({
            where: {
                daily_blast_id: dailyBlastId,
                status: {
                    [Op.notIn]: ['COMPLETED', 'CANCELLED']
                }
            }
        });

        if (incompleteBlasts > 0) {
            throw new Error('Cannot complete operation with incomplete blasts');
        }

        // Check explosive reconciliation
        const balance = await this.calculateExplosiveBalance(dailyBlastId);
        const unbalancedExplosives = Object.entries(balance)
            .filter(([_, data]) => Math.abs(data.remaining) > 0.01);

        if (unbalancedExplosives.length > 0) {
            throw new Error('Cannot complete operation with unbalanced explosives');
        }
    }

    async completeDailyBlast(dailyBlastId, userId) {
        return this.updateStatus(dailyBlastId, 'COMPLETED', userId);
    }

    async getDailySummary(dailyBlastId) {
        const operation = await this.getDailyBlastDetails(dailyBlastId);
        const balance = await this.calculateExplosiveBalance(dailyBlastId);

        return {
            operationDetails: {
                dailyBlastId: operation.daily_blast_id,
                date: operation.operation_date,
                miningSite: operation.MiningSite.site_name,
                status: operation.status,
                weatherConditions: operation.weather_conditions
            },
            blastingSummary: {
                plannedBlasts: operation.number_of_planned_blasts,
                completedBlasts: operation.BlastEvents.filter(e => e.status === 'COMPLETED').length,
                cancelledBlasts: operation.BlastEvents.filter(e => e.status === 'CANCELLED').length
            },
            explosiveSummary: balance
        };
    }
}

module.exports = new DailyBlastOperationService();


