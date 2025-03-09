
// services/blast-hole.service.js
const { 
    BlastHole,
    BlastHoleExplosive,
    BlastEvent,
    BlastEventExplosive,
    DailyBlastOperation,
    ExplosiveIssuance,
    ExplosiveIssuanceItem,
    DrillHole,
    ExplosiveType,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

class BlastHoleService {


    async validateDrillHoles(holes, blastEvent, transaction) {
        // Get all drill holes
        const drillHoles = await DrillHole.findAll({
            where: {
                hole_id: holes.map(h => h.drill_hole_id)
            },
            transaction
        });
    
        // Validate existence
        if (drillHoles.length !== holes.length) {
            throw new Error('One or more drill holes not found');
        }
    
        // Validate drilling site
        const invalidSiteHoles = drillHoles.filter(
            hole => hole.drilling_site_id !== blastEvent.drilling_site_id
        );
        if (invalidSiteHoles.length > 0) {
            throw new Error('All drill holes must belong to the same drilling site as the blast event');
        }
    
        // Validate status
        const invalidStatusHoles = drillHoles.filter(
            hole => hole.status !== 'DRILLED'
        );
        if (invalidStatusHoles.length > 0) {
            throw new Error('All drill holes must be in DRILLED status');
        }
    
        // Check if holes are already used in other blast events
        const usedHoles = await BlastHole.findAll({
            where: {
                drill_hole_id: holes.map(h => h.drill_hole_id),
                blast_id: { [Op.ne]: blastEvent.blast_id }
            },
            transaction
        });
        if (usedHoles.length > 0) {
            throw new Error('One or more drill holes are already used in other blast events');
        }
    
        return drillHoles;
    }



    async updateDrillHoleStatus(drillHoles, newStatus, transaction) {
        await Promise.all(
            drillHoles.map(hole => 
                hole.update({ 
                    status: newStatus 
                }, { transaction })
            )
        );
    }










    /*async createBatchHoles(data) {
        const transaction = await sequelize.transaction();
        try {
            // Get blast event and validate
            const blastEvent = await BlastEvent.findOne({
                where: { blast_id: data.blastId },
                include: [{
                    model: DailyBlastOperation,
                    include: [{
                        model: ExplosiveIssuance,
                        include: [ExplosiveIssuanceItem]
                    }]
                }]
            });

            if (!blastEvent) {
                throw new Error('Blast event not found');
            }

            // Validate blast event status
            if (!['PLANNED', 'READY'].includes(blastEvent.status)) {
                throw new Error('Blast event must be in PLANNED or READY status to add holes');
            }

            // Calculate required explosives
            const explosiveRequirements = this.calculateTotalExplosiveRequirements(data.holes);

            // Validate against available explosives
            await this.validateExplosiveAvailability(
                blastEvent.DailyBlastOperation.ExplosiveIssuances,
                explosiveRequirements
            );

            // Create holes and record explosives
            const createdHoles = await this.createHolesWithExplosives(
                data.blastId,
                data.holes,
                transaction
            );

            // Update blast event explosive totals
            await this.updateBlastExplosiveTotals(
                data.blastId,
                explosiveRequirements,
                transaction
            );

            // Update daily operation explosive usage
            await this.updateDailyOperationExplosives(
                blastEvent.daily_blast_id,
                transaction
            );

            // Update issuance records
            await this.updateExplosiveIssuanceRecords(
                blastEvent.DailyBlastOperation.ExplosiveIssuances,
                data.blastId,
                transaction
            );

            // Update blast event status if needed
            if (blastEvent.status === 'PLANNED') {
                await blastEvent.update({
                    status: 'CHARGING',
                    updated_by: data.userId
                }, { transaction });
            }

            await transaction.commit();

            return {
                holes: await this.getBlastHoles(data.blastId),
                explosiveSummary: await this.calculateBlastExplosiveSummary(data.blastId)
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/


       /* async createBatchHoles(data) {
            const transaction = await sequelize.transaction();
            try {
                // Get blast event and validate
                const blastEvent = await BlastEvent.findOne({
                    where: { blast_id: data.blastId },
                    include: [{
                        model: DailyBlastOperation,
                        as: 'dailyBlastOperation',
                        include: [{
                            model: ExplosiveIssuance,
                            as: 'explosiveIssuances',
                            include: [ExplosiveIssuanceItem]
                        }]
                    }]
                });
        
                if (!blastEvent) {
                    throw new Error('Blast event not found');
                }
        
                // Validate blast event status
                if (!['PLANNED', 'READY'].includes(blastEvent.status)) {
                    throw new Error('Blast event must be in PLANNED or READY status to add holes');
                }
        
                // Validate drill holes
                const drillHoles = await this.validateDrillHoles(data.holes, blastEvent, transaction);
        
                // Calculate and validate explosive requirements
                const explosiveRequirements = this.calculateTotalExplosiveRequirements(data.holes);
                await this.validateExplosiveAvailability(
                    blastEvent.dailyBlastOperation.explosiveIssuances,
                    explosiveRequirements
                );
        
                // Create blast holes
                const createdHoles = await this.createHolesWithExplosives(
                    data.blastId,
                    data.holes,
                    transaction
                );
        
                // Update drill hole statuses
                await this.updateDrillHoleStatus(drillHoles, 'CHARGED', transaction);
        
                // Update blast event explosive totals and status
                await this.updateBlastExplosiveTotals(
                    data.blastId,
                    explosiveRequirements,
                    transaction
                );
        
                await blastEvent.update({
                    status: 'CHARGING',
                    updated_by: data.userId
                }, { transaction });
        
                await transaction.commit();
        
                return {
                    holes: await this.getBlastHoles(data.blastId),
                    explosiveSummary: await this.calculateBlastExplosiveSummary(data.blastId)
                };
        
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }*/


            async createBatchHoles(data) {
                const transaction = await sequelize.transaction();
                try {
                    // Get blast event with all necessary relationships
                    const blastEvent = await BlastEvent.findOne({
                        where: { blast_id: data.blastId },
                        include: [{
                            model: DailyBlastOperation,
                            as: 'dailyBlastOperation',
                            include: [{
                                model: ExplosiveIssuance,
                                as: 'explosiveIssuances',
                                include: [{
                                    model: ExplosiveIssuanceItem,
                                    include: [{
                                        model: ExplosiveType
                                    }]
                                }]
                            }]
                        }]
                    });
            
                    if (!blastEvent) {
                        throw new Error('Blast event not found');
                    }
            
                    // Validate blast event status
                    if (!['PLANNED', 'READY'].includes(blastEvent.status)) {
                        throw new Error('Blast event must be in PLANNED or READY status to add holes');
                    }
            
                    // Validate drill holes and get their details
                    const drillHoles = await this.validateDrillHoles(data.holes, blastEvent, transaction);
            
                    // Calculate explosive requirements per type
                    const explosiveRequirements = this.calculateTotalExplosiveRequirements(data.holes);
            
                    // Get available issuances and validate quantities
                    const availableIssuances = await this.getAvailableIssuances(
                        blastEvent.dailyBlastOperation.explosiveIssuances,
                        explosiveRequirements
                    );
            
                    // Create blast holes and record explosives with issuance tracking
                    const createdHoles = await this.createHolesWithExplosivesAndIssuanceTracking(
                        data.blastId,
                        data.holes,
                        availableIssuances,
                        transaction
                    );
            
                    // Update drill hole statuses
                    await this.updateDrillHoleStatus(drillHoles, 'CHARGED', transaction);
            
                    // Update blast event explosive totals
                    await this.updateBlastExplosiveTotals(
                        data.blastId,
                        explosiveRequirements,
                        transaction
                    );
            
                    // Update blast event status
                    await blastEvent.update({
                        status: 'CHARGING',
                        updated_by: data.userId
                    }, { transaction });
            
                    await transaction.commit();
            
                    return {
                        holes: await this.getBlastHoles(data.blastId),
                        explosiveSummary: await this.calculateBlastExplosiveSummary(data.blastId)
                    };
            
                } catch (error) {
                    await transaction.rollback();
                    throw error;
                }
            }


            async getAvailableIssuances(issuances, requirements) {
                // Track available quantities for each explosive type across issuances
                const availableIssuances = {};
            
                // Process each issuance to find available quantities
                for (const issuance of issuances) {
                    for (const item of issuance.ExplosiveIssuanceItems) {
                        const typeId = item.explosive_type_id;
                        const available = parseFloat(item.quantity_issued) - parseFloat(item.quantity_used || 0);
            
                        if (available > 0) {
                            if (!availableIssuances[typeId]) {
                                availableIssuances[typeId] = [];
                            }
                            
                            availableIssuances[typeId].push({
                                issuanceId: issuance.issuance_id,
                                issuanceItemId: item.issuance_item_id,
                                available
                            });
                        }
                    }
                }
            
                // Validate against requirements
                for (const [typeId, required] of Object.entries(requirements)) {
                    const totalAvailable = (availableIssuances[typeId] || [])
                        .reduce((sum, item) => sum + item.available, 0);
            
                    if (required > totalAvailable) {
                        throw new Error(
                            `Insufficient quantity for explosive type ${typeId}. ` +
                            `Required: ${required}, Available: ${totalAvailable}`
                        );
                    }
                }
            
                return availableIssuances;
            }
            
            async createHolesWithExplosivesAndIssuanceTracking(blastId, holes, availableIssuances, transaction) {
                const createdHoles = [];
                const issuanceUsage = new Map(); // Track usage per issuance item
            
                for (const holeData of holes) {
                    // Create blast hole
                    const hole = await BlastHole.create({
                        blast_id: blastId,
                        drill_hole_id: holeData.drill_hole_id,
                        hole_number: holeData.hole_number,
                        charge_length: holeData.charge_length,
                        stemming_height: holeData.stemming_height,
                        delay_number: holeData.delay_number,
                        status: 'CHARGED',
                        remarks: holeData.remarks
                    }, { transaction });
            
                    // Process explosives for this hole
                    for (const explosive of holeData.explosives) {
                        const typeId = explosive.explosive_type_id;
                        const quantity = parseFloat(explosive.quantity);
            
                        // Get available issuances for this explosive type
                        const availableForType = availableIssuances[typeId] || [];
                        let remainingQuantity = quantity;
            
                        // Allocate quantity across available issuances
                        for (const issuance of availableForType) {
                            if (remainingQuantity <= 0) break;
            
                            const allocatedQuantity = Math.min(remainingQuantity, issuance.available);
                            
                            // Create blast hole explosive record with issuance tracking
                            await BlastHoleExplosive.create({
                                blast_hole_id: hole.blast_hole_id,
                                explosive_type_id: typeId,
                                quantity: allocatedQuantity,
                                issuance_item_id: issuance.issuanceItemId,
                                remarks: explosive.remarks
                            }, { transaction });
            
                            // Track usage for this issuance item
                            const key = issuance.issuanceItemId;
                            issuanceUsage.set(key, (issuanceUsage.get(key) || 0) + allocatedQuantity);
            
                            remainingQuantity -= allocatedQuantity;
                            issuance.available -= allocatedQuantity;
                        }
            
                        if (remainingQuantity > 0) {
                            throw new Error(`Insufficient quantity available for explosive type ${typeId}`);
                        }
                    }
            
                    createdHoles.push(hole);
                }
            
                // Update explosive issuance items with tracked usage
                for (const [issuanceItemId, usedQuantity] of issuanceUsage.entries()) {
                    await ExplosiveIssuanceItem.increment(
                        { quantity_used: usedQuantity },
                        { 
                            where: { issuance_item_id: issuanceItemId },
                            transaction 
                        }
                    );
                }
            
                return createdHoles;
            }
            
            // Helper method to calculate explosive requirements
            calculateTotalExplosiveRequirements(holes) {
                return holes.reduce((totals, hole) => {
                    hole.explosives.forEach(exp => {
                        const typeId = exp.explosive_type_id;
                        totals[typeId] = (totals[typeId] || 0) + parseFloat(exp.quantity);
                    });
                    return totals;
                }, {});
            }


    calculateTotalExplosiveRequirements(holes) {
        const requirements = {};
        
        holes.forEach(hole => {
            hole.explosives.forEach(exp => {
                const typeId = exp.explosive_type_id;
                requirements[typeId] = (requirements[typeId] || 0) + parseFloat(exp.quantity);
            });
        });

        return requirements;
    }

    async validateExplosiveAvailability(issuances, requirements) {
        const available = {};
        
        // Calculate available quantities
        issuances.forEach(issuance => {
            issuance.ExplosiveIssuanceItems.forEach(item => {
                const typeId = item.explosive_type_id;
                if (!available[typeId]) {
                    available[typeId] = {
                        issued: 0,
                        used: 0
                    };
                }
                available[typeId].issued += parseFloat(item.quantity_issued);
                available[typeId].used += parseFloat(item.quantity_used || 0);
            });
        });

        // Check against requirements
        for (const [typeId, required] of Object.entries(requirements)) {
            const availableQty = (available[typeId]?.issued || 0) - (available[typeId]?.used || 0);
            if (required > availableQty) {
                throw new Error(`Insufficient quantity for explosive type ${typeId}. Required: ${required}, Available: ${availableQty}`);
            }
        }
    }

    async createHolesWithExplosives(blastId, holes, transaction) {
        const createdHoles = [];

        for (const holeData of holes) {
            // Create blast hole
            const hole = await BlastHole.create({
                blast_id: blastId,
                drill_hole_id: holeData.drill_hole_id,
                hole_number: holeData.hole_number,
                charge_length: holeData.charge_length,
                stemming_height: holeData.stemming_height,
                delay_number: holeData.delay_number,
                status: 'CHARGED',
                remarks: holeData.remarks
            }, { transaction });

            // Create explosive records for hole
            const explosives = await Promise.all(
                holeData.explosives.map(exp => 
                    BlastHoleExplosive.create({
                        blast_hole_id: hole.blast_hole_id,
                        explosive_type_id: exp.explosive_type_id,
                        quantity: exp.quantity,
                        remarks: exp.remarks
                    }, { transaction })
                )
            );

            createdHoles.push({
                ...hole.toJSON(),
                explosives
            });
        }

        return createdHoles;
    }

    async updateBlastExplosiveTotals(blastId, requirements, transaction) {
        for (const [typeId, quantity] of Object.entries(requirements)) {
            await BlastEventExplosive.upsert({
                blast_id: blastId,
                explosive_type_id: typeId,
                quantity_used: sequelize.literal(`COALESCE(quantity_used, 0) + ${quantity}`)
            }, { transaction });
        }
    }

    async updateDailyOperationExplosives(dailyBlastId, transaction) {
        const blastEvents = await BlastEvent.findAll({
            where: { daily_blast_id: dailyBlastId },
            include: [BlastEventExplosive]
        });

        // Calculate totals by explosive type
        const totals = {};
        blastEvents.forEach(blast => {
            blast.BlastEventExplosives.forEach(exp => {
                const typeId = exp.explosive_type_id;
                totals[typeId] = (totals[typeId] || 0) + parseFloat(exp.quantity_used);
            });
        });

        // Update daily totals
        for (const [typeId, total] of Object.entries(totals)) {
            await DailyBlastExplosive.upsert({
                daily_blast_id: dailyBlastId,
                explosive_type_id: typeId,
                quantity_used: total
            }, { transaction });
        }
    }

    async updateExplosiveIssuanceRecords(issuances, blastId, transaction) {
        for (const issuance of issuances) {
            for (const item of issuance.ExplosiveIssuanceItems) {
                const totalUsed = await this.calculateTotalUsageForExplosive(
                    item.explosive_type_id,
                    issuance.daily_blast_id
                );

                await item.update({
                    quantity_used: totalUsed,
                    last_calculation_time: new Date()
                }, { transaction });
            }
        }
    }

    async calculateTotalUsageForExplosive(explosiveTypeId, dailyBlastId) {
        const result = await BlastHoleExplosive.sum('quantity', {
            include: [{
                model: BlastHole,
                include: [{
                    model: BlastEvent,
                    where: { daily_blast_id: dailyBlastId }
                }]
            }],
            where: { explosive_type_id: explosiveTypeId }
        });

        return result || 0;
    }

    async getBlastHoles(blastId) {
        const holes = await BlastHole.findAll({
            where: { blast_id: blastId },
            include: [{
                model: BlastHoleExplosive,
                as: 'blastHoleExplosives',
                include: ['explosiveType']
            }],
            order: [
                ['hole_number', 'ASC']
            ]
        });
    
        // Call calculateBlastExplosiveSummary to test it
        const summary = await this.calculateBlastExplosiveSummary(blastId);
    
        return {
            holes,
            explosiveSummary: summary
        };
    }

    async getHoleDetails(holeId) {
        const hole = await BlastHole.findOne({
            where: { blast_hole_id: holeId },
            include: [
                {
                    model: BlastHoleExplosive,
                    include: ['explosiveType']
                },
                {
                    model: DrillHole,
                    attributes: ['depth', 'diameter', 'angle']
                },
                {
                    model: BlastEvent,
                    attributes: ['blast_id', 'status', 'blast_sequence_number']
                }
            ]
        });

        if (!hole) {
            throw new Error('Blast hole not found');
        }

        return hole;
    }

    async updateHoleStatus(holeId, newStatus, remarks, userId) {
        const transaction = await sequelize.transaction();
        try {
            const hole = await BlastHole.findByPk(holeId);
            if (!hole) {
                throw new Error('Blast hole not found');
            }

            if (!this.isValidHoleStatus(hole.status, newStatus)) {
                throw new Error(`Invalid status transition from ${hole.status} to ${newStatus}`);
            }

            await hole.update({
                status: newStatus,
                remarks: remarks || hole.remarks
            }, { transaction });

            // If marking as misfired, update blast event status
            if (newStatus === 'MISFIRED') {
                await this.handleMisfiredHole(hole.blast_id, transaction);
            }

            await transaction.commit();
            return await this.getHoleDetails(holeId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    isValidHoleStatus(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['CHARGED'],
            'CHARGED': ['FIRED', 'MISFIRED'],
            'FIRED': [],
            'MISFIRED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }

    async handleMisfiredHole(blastId, transaction) {
        const blast = await BlastEvent.findByPk(blastId);
        if (blast) {
            await blast.update({
                status: 'INCOMPLETE',
                remarks: 'Misfire reported in one or more holes'
            }, { transaction });
        }
    }







    async calculateBlastExplosiveSummary(blastId) {
        const result = await BlastEvent.findOne({
            where: { blast_id: blastId },
            include: [
                {
                    model: BlastEventExplosive,
                    as: 'blastEventExplosives',
                    include: [{
                        model: ExplosiveType,
                        as: 'explosiveType'
                    }]
                },
                {
                    model: DailyBlastOperation,
                    as: 'dailyBlastOperation',
                    include: [{
                        model: ExplosiveIssuance,
                        as: 'explosiveIssuances',
                        include: [{
                            model: ExplosiveIssuanceItem,
                            include: [{
                                model: ExplosiveType
                            }]
                        }]
                    }]
                }
            ]
        });
    
        if (!result) {
            throw new Error('Blast event not found');
        }
    
        // Calculate totals used in blast
        const explosivesUsed = {};
        result.blastEventExplosives.forEach(explosive => {
            const typeId = explosive.explosive_type_id;
            if (!explosivesUsed[typeId]) {
                explosivesUsed[typeId] = {
                    typeId: typeId,
                    typeName: explosive.explosiveType.TypeName,
                    unit: explosive.explosiveType.UnitOfMeasurement,
                    quantityUsed: 0
                };
            }
            explosivesUsed[typeId].quantityUsed += parseFloat(explosive.quantity_used || 0);
        });
    
        // Calculate issuance totals
        const issuanceTotals = {};
        result.dailyBlastOperation.explosiveIssuances.forEach(issuance => {
            issuance.ExplosiveIssuanceItems.forEach(item => {
                const typeId = item.explosive_type_id;
                if (!issuanceTotals[typeId]) {
                    issuanceTotals[typeId] = {
                        typeId: typeId,
                        typeName: item.ExplosiveType.TypeName,
                        unit: item.ExplosiveType.UnitOfMeasurement,
                        quantityIssued: 0,
                        quantityRemaining: 0
                    };
                }
                issuanceTotals[typeId].quantityIssued += parseFloat(item.quantity_issued || 0);
                issuanceTotals[typeId].quantityRemaining = 
                    issuanceTotals[typeId].quantityIssued - (explosivesUsed[typeId]?.quantityUsed || 0);
            });
        });
    
        return {
            blastId: blastId,
            explosivesUsed: Object.values(explosivesUsed),
            issuanceTotals: Object.values(issuanceTotals)
        };
    }
}

module.exports = new BlastHoleService();