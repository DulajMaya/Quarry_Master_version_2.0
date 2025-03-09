// services/blast-event.service.js
/*const { 
    BlastEvent, 
    DailyBlastOperation, 
    DrillingSite, 
    DrillHole,
    BlastEventExplosive,
    DailyBlastExplosive,
    ExplosiveType
} = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class BlastEventService {
    async createBlastEvent(data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting blast event creation:', {
                dailyBlastId: data.daily_blast_id,
                drillingSiteId: data.drilling_site_id
            });

            // Validate daily operation
            const dailyOperation = await DailyBlastOperation.findOne({
                where: { 
                    daily_blast_id: data.daily_blast_id,
                    status: {
                        [Op.in]: ['PLANNED', 'ONGOING']
                    }
                }
            });

            if (!dailyOperation) {
                throw new Error('Daily blast operation not found or not in valid status');
            }

            // Get sequence number for the day
            const sequenceNumber = await this.getNextSequenceNumber(data.daily_blast_id);

            // Create blast event
            const blastEvent = await BlastEvent.create({
                ...data,
                blast_sequence_number: sequenceNumber,
                created_by: data.userId
            }, { transaction });

            // Create explosive records if provided
            if (data.explosives) {
                await this.createBlastExplosives(blastEvent, data.explosives, transaction);
            }

            // Update daily operation status if needed
            if (dailyOperation.status === 'PLANNED') {
                await dailyOperation.update({ status: 'ONGOING' }, { transaction });
            }

            await transaction.commit();
            console.log('Successfully created blast event:', {
                blastId: blastEvent.blast_id,
                sequenceNumber
            });

            return blastEvent;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in createBlastEvent:', error);
            throw error;
        }
    }

    async getNextSequenceNumber(daily_blast_id) {
        const lastBlast = await BlastEvent.findOne({
            where: { daily_blast_id },
            order: [['blast_sequence_number', 'DESC']]
        });
        return (lastBlast?.blast_sequence_number || 0) + 1;
    }

    async createBlastExplosives(blastEvent, explosives, transaction) {
        // Validate against daily operation explosives
        const dailyExplosives = await DailyBlastExplosive.findAll({
            where: { daily_blast_id: blastEvent.daily_blast_id }
        });

        const explosiveRecords = [];
        for (const explosive of explosives) {
            const dailyExplosive = dailyExplosives.find(
                de => de.explosive_type_id === explosive.explosive_type_id
            );

            if (!dailyExplosive) {
                throw new Error(`Explosive type ${explosive.explosive_type_id} not available in daily operation`);
            }

            // Check available quantity
            const usedQuantity = await this.getUsedExplosiveQuantity(
                blastEvent.daily_blast_id,
                explosive.explosive_type_id
            );
            const availableQuantity = dailyExplosive.quantity_issued - usedQuantity;

            if (explosive.quantity_planned > availableQuantity) {
                throw new Error(`Insufficient quantity available for explosive type ${explosive.explosive_type_id}`);
            }

            explosiveRecords.push(
                await BlastEventExplosive.create({
                    blast_id: blastEvent.blast_id,
                    explosive_type_id: explosive.explosive_type_id,
                    quantity_planned: explosive.quantity_planned,
                    remarks: explosive.remarks
                }, { transaction })
            );
        }

        return explosiveRecords;
    }

    async getUsedExplosiveQuantity(daily_blast_id, explosive_type_id) {
        const result = await BlastEventExplosive.sum('quantity_used', {
            include: [{
                model: BlastEvent,
                where: { daily_blast_id }
            }],
            where: { explosive_type_id }
        });
        return result || 0;
    }

    async getBlastEvents(daily_blast_id, query = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                search
            } = query;

            const where = { 
                daily_blast_id,
                is_active: true 
            };

            if (status) {
                where.status = status;
            }

            const blastEvents = await BlastEvent.findAndCountAll({
                where,
                include: [
                    {
                        model: DrillingSite,
                        as: 'drillingSite'
                    },
                    {
                        model: BlastEventExplosive,
                        as: 'blastEventExplosives',
                        include: [{
                            model: ExplosiveType,
                            as: 'explosiveType'
                        }]
                    }
                ],
                order: [['blast_sequence_number', 'ASC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            return {
                total: blastEvents.count,
                pages: Math.ceil(blastEvents.count / limit),
                currentPage: parseInt(page),
                blastEvents: blastEvents.rows
            };
        } catch (error) {
            console.error('Error in getBlastEvents:', error);
            throw error;
        }
    }

    async updateBlastEvent(blast_id, data) {
        const transaction = await sequelize.transaction();
        try {
            const blastEvent = await BlastEvent.findOne({
                where: { 
                    blast_id,
                    is_active: true 
                },
                include: [{
                    model: DailyBlastOperation,
                    as: 'dailyBlastOperation'
                }]
            });

            if (!blastEvent) {
                throw new Error('Blast event not found');
            }

            // Validate status transition
            if (data.status && !this.isValidStatusTransition(blastEvent.status, data.status)) {
                throw new Error(`Invalid status transition from ${blastEvent.status} to ${data.status}`);
            }

            // Update blast event
            await blastEvent.update(data, { transaction });

            // Handle explosive updates if provided
            if (data.explosives) {
                await this.updateBlastExplosives(blastEvent, data.explosives, transaction);
            }

            await transaction.commit();
            return blastEvent;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateBlastEvent:', error);
            throw error;
        }
    }

    // ... continuing in next message due to length ...
    // services/blast-event.service.js (continued)

    async updateBlastExplosives(blastEvent, explosives, transaction) {
        try {
            for (const explosive of explosives) {
                const record = await BlastEventExplosive.findOne({
                    where: {
                        blast_id: blastEvent.blast_id,
                        explosive_type_id: explosive.explosive_type_id
                    }
                });

                if (!record) {
                    throw new Error(`No existing record found for explosive type ${explosive.explosive_type_id}`);
                }

                // Validate quantity against daily allocation
                await this.validateExplosiveQuantity(
                    blastEvent.daily_blast_id,
                    explosive.explosive_type_id,
                    explosive.quantity_used,
                    record.blast_id
                );

                // Update record
                await record.update({
                    quantity_used: explosive.quantity_used,
                    remarks: explosive.remarks
                }, { transaction });
            }
        } catch (error) {
            console.error('Error updating blast explosives:', error);
            throw error;
        }
    }

    async validateExplosiveQuantity(dailyBlastId, explosiveTypeId, quantity, excludeBlastId = null) {
        const dailyExplosive = await DailyBlastExplosive.findOne({
            where: { 
                daily_blast_id: dailyBlastId,
                explosive_type_id: explosiveTypeId
            }
        });

        if (!dailyExplosive) {
            throw new Error('Explosive type not found in daily allocation');
        }

        // Get total used quantity excluding current blast if updating
        const whereClause = {
            include: [{
                model: BlastEvent,
                where: { daily_blast_id: dailyBlastId }
            }],
            where: { explosive_type_id: explosiveTypeId }
        };

        if (excludeBlastId) {
            whereClause.where.blast_id = { [Op.ne]: excludeBlastId };
        }

        const usedQuantity = await BlastEventExplosive.sum('quantity_used', whereClause) || 0;

        if (usedQuantity + quantity > dailyExplosive.quantity_issued) {
            throw new Error('Total quantity exceeds daily allocation');
        }

        return true;
    }

    async completeBlastEvent(blast_id) {
        const transaction = await sequelize.transaction();
        try {
            const blastEvent = await BlastEvent.findOne({
                where: { blast_id },
                include: [
                    {
                        model: BlastEventExplosive,
                        as: 'blastEventExplosives'
                    }
                ]
            });

            if (!blastEvent) {
                throw new Error('Blast event not found');
            }

            if (blastEvent.status !== 'CHARGING') {
                throw new Error('Blast event must be in CHARGING status to complete');
            }

            // Validate all explosives have been accounted for
            for (const explosive of blastEvent.blastEventExplosives) {
                if (explosive.quantity_used === null) {
                    throw new Error('All explosive quantities must be recorded before completion');
                }
            }

            // Update blast event status
            await blastEvent.update({
                status: 'COMPLETED',
                blast_time: new Date()
            }, { transaction });

            // Update drill holes status
            await DrillHole.update(
                { status: 'BLASTED' },
                { 
                    where: { hole_id: { [Op.in]: blastEvent.drill_hole_ids } },
                    transaction 
                }
            );

            await transaction.commit();
            return blastEvent;
        } catch (error) {
            await transaction.rollback();
            console.error('Error completing blast event:', error);
            throw error;
        }
    }

    async uploadBlastPattern(blast_id, file) {
        try {
            const blastEvent = await BlastEvent.findByPk(blast_id);
            if (!blastEvent) {
                throw new Error('Blast event not found');
            }

            // Upload file logic would go here
            // Update pattern_sketch_url
            await blastEvent.update({
                pattern_sketch_url: file.path
            });

            return blastEvent;
        } catch (error) {
            console.error('Error uploading blast pattern:', error);
            throw error;
        }
    }

    async getBlastSummary(blast_id) {
        try {
            const blastEvent = await BlastEvent.findOne({
                where: { blast_id },
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
                        model: DrillingSite,
                        as: 'drillingSite'
                    }
                ]
            });

            if (!blastEvent) {
                throw new Error('Blast event not found');
            }

            // Calculate totals and summaries
            const summary = {
                blastInfo: {
                    sequenceNumber: blastEvent.blast_sequence_number,
                    status: blastEvent.status,
                    timeCompleted: blastEvent.blast_time,
                    location: {
                        drillingSite: blastEvent.drillingSite.bench_id,
                        coordinates: {
                            kadawala: {
                                north: blastEvent.kadawala_north,
                                east: blastEvent.kadawala_east
                            },
                            wgs84: {
                                latitude: blastEvent.wgs84_latitude,
                                longitude: blastEvent.wgs84_longitude
                            }
                        }
                    }
                },
                explosives: blastEvent.blastEventExplosives.map(exp => ({
                    type: exp.explosiveType.TypeName,
                    planned: exp.quantity_planned,
                    used: exp.quantity_used,
                    unit: exp.explosiveType.UnitOfMeasurement
                })),
                totals: {
                    numberOfHoles: blastEvent.number_of_holes,
                    totalExplosivesPlanned: blastEvent.blastEventExplosives.reduce(
                        (acc, exp) => acc + parseFloat(exp.quantity_planned), 0
                    ),
                    totalExplosivesUsed: blastEvent.blastEventExplosives.reduce(
                        (acc, exp) => acc + parseFloat(exp.quantity_used || 0), 0
                    )
                }
            };

            return summary;
        } catch (error) {
            console.error('Error getting blast summary:', error);
            throw error;
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['READY', 'CANCELLED'],
            'READY': ['CHARGING', 'CANCELLED'],
            'CHARGING': ['COMPLETED', 'CANCELLED'],
            'COMPLETED': [],
            'CANCELLED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }
}

module.exports = new BlastEventService();*/


// services/blast-event.service.js
const { 
    BlastEvent,
    BlastHole,
    BlastHoleExplosive,
    BlastEventExplosive,
    DailyBlastOperation,
    DailyBlastExplosive,
    ExplosiveIssuance,
    ExplosiveIssuanceItem,
    DrillingSite,
    DrillHole,
    BlastResult,
    sequelize,
    ExplosiveType
} = require('../models');
const { Op } = require('sequelize');

const fs = require('fs');
const path = require('path');

class BlastEventService {
    /*async createBlastEvent(data) {
        const transaction = await sequelize.transaction();
        try {
            // Validate daily blast operation
            const dailyOperation = await DailyBlastOperation.findOne({
                where: {
                    daily_blast_id: data.daily_blast_id,
                    is_active: true
                },
                include: [{
                    model: BlastEvent,
                    where: { is_active: true }
                }]
            });

            if (!dailyOperation) {
                throw new Error('Daily blast operation not found or inactive');
            }

            // Check if blast limit exceeded
            if (dailyOperation.BlastEvents.length >= dailyOperation.number_of_planned_blasts) {
                throw new Error('Planned blast limit exceeded for this daily operation');
            }

            // Get next sequence number for the day
            const blastSequence = await this.getNextBlastSequence(data.daily_blast_id);

            let pattern_sketch_url = null;
        if (data.delay_pattern_sketch_file) {
            pattern_sketch_url = data.pattern_sketch_file.path.replace(/\\/g, '/');
        }

            

            // Create blast event
            const blastEvent = await BlastEvent.create({
                daily_blast_id: data.daily_blast_id,
                drilling_site_id: data.drilling_site_id,
                blast_sequence_number: blastSequence,
                kadawala_north: data.kadawala_north,
                kadawala_east: data.kadawala_east,
                number_of_holes: data.number_of_holes,
                delya_pattern_sketch_url: data.pattern_sketch_url,
                status: 'PLANNED',
                rock_description: data.rock_description,
                remarks: data.remarks,
                created_by: data.userId
            }, { transaction });

            await transaction.commit();
            return this.getBlastEventDetails(blastEvent.blast_id);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/

       /* async createBlastEvent(data) {
            const transaction = await sequelize.transaction();
            try {
                // Validate daily blast operation
                const dailyOperation = await DailyBlastOperation.findOne({
                    where: {
                        daily_blast_id: data.daily_blast_id,
                        is_active: true
                    },
                    include: [{
                        model: BlastEvent,
                        as: 'blastEvents',
                        where: { is_active: true }
                    }]
                });
        
                if (!dailyOperation) {
                    throw new Error('Daily blast operation not found or inactive');
                }
        
                // Check if blast limit exceeded
                if (dailyOperation.BlastEvents.length >= dailyOperation.number_of_planned_blasts) {
                    throw new Error('Planned blast limit exceeded for this daily operation');
                }
        
                // Get next sequence number for the day
                const blastSequence = await this.getNextBlastSequence(data.daily_blast_id);
        
                // Handle delay pattern sketch file if uploaded
                let delay_pattern_sketch_url = null;
                if (data.delayPatternFile) {
                    delay_pattern_sketch_url = data.delayPatternFile.path.replace(/\\/g, '/');
                }
        
                // Create blast event
                const blastEvent = await BlastEvent.create({
                    daily_blast_id: data.daily_blast_id,
                    drilling_site_id: data.drilling_site_id,
                    blast_sequence_number: blastSequence,
                    kadawala_north: data.kadawala_north,
                    kadawala_east: data.kadawala_east,
                    number_of_holes: data.number_of_holes,
                    delay_pattern_sketch_url, // Use the processed file path
                    status: 'PLANNED',
                    rock_description: data.rock_description,
                    remarks: data.remarks,
                    created_by: data.userId
                }, { transaction });
        
                await transaction.commit();
                return this.getBlastEventDetails(blastEvent.blast_id);
        
            } catch (error) {
                await transaction.rollback();
                // If there was an error and we uploaded a file, clean it up
                if (data.delayPatternFile && data.delayPatternFile.path) {
                    fs.unlinkSync(data.delayPatternFile.path);
                }
                throw error;
            }
        }*/


            async createBlastEvent(data) {
                const transaction = await sequelize.transaction();
                try {
                    // Modified query to check daily blast operation
                    const dailyOperation = await DailyBlastOperation.findOne({
                        where: {
                            daily_blast_id: data.daily_blast_id,
                            is_active: true
                        }
                    });
            
                    if (!dailyOperation) {
                        throw new Error('Daily blast operation not found or inactive');
                    }
            
                    // Get count of active blast events separately
                    const existingBlasts = await BlastEvent.count({
                        where: {
                            daily_blast_id: data.daily_blast_id,
                            is_active: true
                        }
                    });
            
                    if (existingBlasts >= dailyOperation.number_of_planned_blasts) {
                        throw new Error('Planned blast limit exceeded for this daily operation');
                    }
            
                    // Get next sequence number
                    const blastSequence = await this.getNextBlastSequence(data.daily_blast_id);
            
                    // Handle delay pattern sketch file if uploaded
                    let delay_pattern_sketch_url = null;
                    if (data.delayPatternFile) {
                        delay_pattern_sketch_url = data.delayPatternFile.path.replace(/\\/g, '/');
                    }
            
                    // Create blast event
                    const blastEvent = await BlastEvent.create({
                        daily_blast_id: data.daily_blast_id,
                        drilling_site_id: data.drilling_site_id,
                        blast_sequence_number: blastSequence,
                        kadawala_north: data.kadawala_north || 0,  // Add default values
                        kadawala_east: data.kadawala_east || 0,   // Add default values
                        number_of_holes: data.number_of_holes || 1,
                        delay_pattern_sketch_url,
                        status: 'PLANNED',
                        rock_description: data.rock_description,
                        remarks: data.remarks,
                        created_by: data.userId,
                        is_active: true
                    }, { transaction });
            
                    await transaction.commit();
                    return this.getBlastEventDetails(blastEvent.blast_id);
            
                } catch (error) {
                    await transaction.rollback();
                    // Clean up file if exists
                    if (data.delayPatternFile && data.delayPatternFile.path) {
                        fs.unlinkSync(data.delayPatternFile.path);
                    }
                    throw error;
                }
            }



    
    async createBlastHoles(blastId, holes, userId) {
        const transaction = await sequelize.transaction();
        try {
            // Get blast event and validate status
            const blastEvent = await BlastEvent.findOne({
                where: { blast_id: blastId },
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

            if (blastEvent.status !== 'PLANNED' && blastEvent.status !== 'READY') {
                throw new Error('Blast event must be in PLANNED or READY status to add holes');
            }

            // Validate available explosives
            const availableExplosives = this.calculateAvailableExplosives(blastEvent.DailyBlastOperation);
            const requiredExplosives = this.calculateRequiredExplosives(holes);

            // Check if sufficient explosives available
            for (const [explosiveTypeId, required] of Object.entries(requiredExplosives)) {
                const available = availableExplosives[explosiveTypeId]?.available || 0;
                if (required > available) {
                    throw new Error(`Insufficient explosive type ${explosiveTypeId}. Required: ${required}, Available: ${available}`);
                }
            }

            // Create blast holes and record explosive usage
            const createdHoles = [];
            for (const holeData of holes) {
                // Create blast hole
                const blastHole = await BlastHole.create({
                    blast_id: blastId,
                    drill_hole_id: holeData.drill_hole_id,
                    hole_number: holeData.hole_number,
                    charge_length: holeData.charge_length,
                    stemming_height: holeData.stemming_height,
                    delay_number: holeData.delay_number,
                    status: 'CHARGED',
                    remarks: holeData.remarks
                }, { transaction });

                // Record explosive usage for hole
                for (const explosive of holeData.explosives) {
                    await BlastHoleExplosive.create({
                        blast_hole_id: blastHole.blast_hole_id,
                        explosive_type_id: explosive.explosive_type_id,
                        quantity: explosive.quantity,
                        remarks: explosive.remarks
                    }, { transaction });
                }

                createdHoles.push(blastHole);
            }

            // Update blast event explosives summary
            await this.updateBlastExplosiveSummary(blastId, transaction);

            // Update daily blast explosives
            await this.updateDailyBlastExplosives(blastEvent.daily_blast_id, transaction);

            // Update explosive issuance items
            await this.updateExplosiveIssuanceUsage(blastEvent.DailyBlastOperation.ExplosiveIssuances, transaction);

            // Update blast event status
            await blastEvent.update({
                status: 'CHARGING',
                updated_by: userId
            }, { transaction });

            await transaction.commit();

            return {
                blast: await this.getBlastEventDetails(blastId),
                explosiveUsage: await this.getExplosiveUsage(blastId)
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    calculateAvailableExplosives(dailyOperation) {
        const available = {};
        
        dailyOperation.ExplosiveIssuances.forEach(issuance => {
            issuance.ExplosiveIssuanceItems.forEach(item => {
                if (!available[item.explosive_type_id]) {
                    available[item.explosive_type_id] = {
                        issued: 0,
                        used: 0,
                        available: 0
                    };
                }
                available[item.explosive_type_id].issued += parseFloat(item.quantity_issued);
                available[item.explosive_type_id].used += parseFloat(item.quantity_used || 0);
            });
        });

        // Calculate available quantities
        Object.keys(available).forEach(typeId => {
            available[typeId].available = 
                available[typeId].issued - available[typeId].used;
        });

        return available;
    }

    calculateRequiredExplosives(holes) {
        const required = {};
        
        holes.forEach(hole => {
            hole.explosives.forEach(exp => {
                required[exp.explosive_type_id] = 
                    (required[exp.explosive_type_id] || 0) + parseFloat(exp.quantity);
            });
        });

        return required;
    }

    async updateBlastExplosiveSummary(blastId, transaction) {
        // Get all blast hole explosives
        const holeExplosives = await BlastHoleExplosive.findAll({
            include: [{
                model: BlastHole,
                where: { blast_id: blastId }
            }]
        });

        // Calculate totals by explosive type
        const totals = {};
        holeExplosives.forEach(explosive => {
            if (!totals[explosive.explosive_type_id]) {
                totals[explosive.explosive_type_id] = 0;
            }
            totals[explosive.explosive_type_id] += parseFloat(explosive.quantity);
        });

        // Update or create blast event explosive records
        for (const [explosiveTypeId, quantity] of Object.entries(totals)) {
            await BlastEventExplosive.upsert({
                blast_id: blastId,
                explosive_type_id: explosiveTypeId,
                quantity_used: quantity
            }, { transaction });
        }
    }

    async updateDailyBlastExplosives(dailyBlastId, transaction) {
        // Get all blast event explosives for the daily operation
        const blastExplosives = await BlastEventExplosive.findAll({
            include: [{
                model: BlastEvent,
                where: { daily_blast_id: dailyBlastId }
            }]
        });

        // Calculate daily totals
        const dailyTotals = {};
        blastExplosives.forEach(explosive => {
            if (!dailyTotals[explosive.explosive_type_id]) {
                dailyTotals[explosive.explosive_type_id] = 0;
            }
            dailyTotals[explosive.explosive_type_id] += parseFloat(explosive.quantity_used);
        });

        // Update daily blast explosive records
        for (const [explosiveTypeId, quantity] of Object.entries(dailyTotals)) {
            await DailyBlastExplosive.upsert({
                daily_blast_id: dailyBlastId,
                explosive_type_id: explosiveTypeId,
                quantity_used: quantity
            }, { transaction });
        }
    }

    async updateExplosiveIssuanceUsage(issuances, transaction) {
        for (const issuance of issuances) {
            for (const item of issuance.ExplosiveIssuanceItems) {
                // Get total usage for this explosive type from all blasts
                const totalUsed = await this.calculateTotalExplosiveUsage(
                    issuance.daily_blast_id,
                    item.explosive_type_id
                );

                // Update issuance item
                await item.update({
                    quantity_used: totalUsed,
                    last_calculation_time: new Date()
                }, { transaction });
            }
        }
    }

    async calculateTotalExplosiveUsage(dailyBlastId, explosiveTypeId) {
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

    // ... (other service methods for status updates, completion, etc.)




    async getNextBlastSequence(dailyBlastId) {
        const maxSequence = await BlastEvent.max('blast_sequence_number', {
            where: { daily_blast_id: dailyBlastId }
        });
        return (maxSequence || 0) + 1;
    }

   /* async getBlastEvents(dailyBlastId) {
        return await BlastEvent.findAll({
            where: { 
                daily_blast_id: dailyBlastId,
                is_active: true
            },
            include: [
                {
                    model: DrillingSite,
                    attributes: ['site_name', 'location']
                },
                {
                    model: BlastHole,
                    include: [{
                        model: BlastHoleExplosive,
                        include: ['explosiveType']
                    }]
                },
                {
                    model: BlastEventExplosive,
                    include: ['explosiveType']
                }
            ],
            order: [['blast_sequence_number', 'ASC']]
        });
    }*/


        async getBlastEvents(dailyBlastId) {
            return await BlastEvent.findAll({
                where: { 
                    daily_blast_id: dailyBlastId,
                    is_active: true
                },
                include: [
                    {
                        model: DrillingSite,
                        as: 'drillingSite',
                        attributes: ['miningSiteId', 'drilling_site_id']
                    },
                    {
                        model: BlastHole,
                        as: 'blastHoles',
                        include: [{
                            model: BlastHoleExplosive,
                            as: 'blastHoleExplosives',
                            include: [{
                                model: ExplosiveType,
                                as: 'explosiveType'
                            }]
                        }]
                    },
                    {
                        model: BlastEventExplosive,
                        as: 'blastEventExplosives',
                        include: [{
                            model: ExplosiveType,
                            as: 'explosiveType'
                        }]
                    }
                ],
                order: [['blast_sequence_number', 'ASC']]
            });
        }





    /*async getBlastEventDetails(blastId) {
        const blast = await BlastEvent.findOne({
            where: { 
                blast_id: blastId,
                is_active: true
            },
            include: [
                {
                    model: DrillingSite,
                    attributes: ['site_name', 'location']
                },
                {
                    model: BlastHole,
                    include: [{
                        model: BlastHoleExplosive,
                        include: ['explosiveType']
                    }]
                },
                {
                    model: BlastEventExplosive,
                    include: ['explosiveType']
                }
            ]
        });

        if (!blast) {
            throw new Error('Blast event not found');
        }

        // Add calculated fields
        const enhancedBlast = blast.toJSON();
        enhancedBlast.explosiveSummary = this.calculateBlastExplosiveSummary(blast);
        enhancedBlast.holesSummary = this.calculateHolesSummary(blast);

        // Add full URL for delay pattern sketch if exists
    if (enhancedBlast.delay_pattern_sketch_url) {
        enhancedBlast.delay_pattern_sketch_url = `${process.env.BASE_URL}/${enhancedBlast.delay_pattern_sketch_url}`;
    }

        return enhancedBlast;
    }*/

        async getBlastEventDetails(blastId) {
            const blast = await BlastEvent.findOne({
                where: { 
                    blast_id: blastId,
                    is_active: true
                },
                include: [
                    {
                        model: DrillingSite,
                        as: 'drillingSite',  // Match the alias from your model associations
                        attributes: ['drilling_site_id', 'miningSiteId']
                    },
                    {
                        model: BlastHole,
                        as: 'blastHoles',    // Match the alias from your model associations
                        include: [{
                            model: BlastHoleExplosive,
                            as: 'blastHoleExplosives',  // Match the alias
                            include: [{
                                model: ExplosiveType,
                                as: 'explosiveType'      // Match the alias
                            }]
                        }]
                    },
                    {
                        model: BlastEventExplosive,
                        as: 'blastEventExplosives',     // Match the alias
                        include: [{
                            model: ExplosiveType,
                            as: 'explosiveType'          // Match the alias
                        }]
                    }
                ]
            });
        
            if (!blast) {
                throw new Error('Blast event not found');
            }
        
            // Add calculated fields
            const enhancedBlast = blast.toJSON();
            enhancedBlast.explosiveSummary = this.calculateBlastExplosiveSummary(blast);
            enhancedBlast.holesSummary = this.calculateHolesSummary(blast);
        
            // Add full URL for delay pattern sketch if exists
            if (enhancedBlast.delay_pattern_sketch_url) {
                enhancedBlast.delay_pattern_sketch_url = `${process.env.BASE_URL}/${enhancedBlast.delay_pattern_sketch_url}`;
            }
        
            return enhancedBlast;
        }





    async getExplosiveUsage(blastId) {
        const blast = await BlastEvent.findOne({
            where: { blast_id: blastId },
            include: [{
                model: BlastHole,
                include: [{
                    model: BlastHoleExplosive,
                    include: ['explosiveType']
                }]
            }]
        });

        if (!blast) {
            throw new Error('Blast event not found');
        }

        return {
            byHole: this.calculateHoleExplosiveUsage(blast),
            total: this.calculateBlastExplosiveSummary(blast)
        };
    }

    calculateHoleExplosiveUsage(blast) {
        return blast.BlastHoles.map(hole => ({
            holeNumber: hole.hole_number,
            chargeLength: hole.charge_length,
            stemmingHeight: hole.stemming_height,
            status: hole.status,
            explosives: hole.BlastHoleExplosives.map(exp => ({
                type: exp.explosiveType.TypeName,
                quantity: parseFloat(exp.quantity),
                unit: exp.explosiveType.UnitOfMeasure
            }))
        }));
    }

    calculateBlastExplosiveSummary(blast) {
        const summary = {};
        
        blast.BlastHoles.forEach(hole => {
            hole.BlastHoleExplosives.forEach(exp => {
                if (!summary[exp.explosive_type_id]) {
                    summary[exp.explosive_type_id] = {
                        type: exp.explosiveType.TypeName,
                        totalQuantity: 0,
                        unit: exp.explosiveType.UnitOfMeasure,
                        holesUsed: new Set()
                    };
                }
                summary[exp.explosive_type_id].totalQuantity += parseFloat(exp.quantity);
                summary[exp.explosive_type_id].holesUsed.add(hole.hole_number);
            });
        });

        // Convert Set to array length for JSON serialization
        Object.values(summary).forEach(item => {
            item.holesCount = item.holesUsed.size;
            delete item.holesUsed;
        });

        return summary;
    }

    calculateHolesSummary(blast) {
        return {
            total: blast.BlastHoles.length,
            charged: blast.BlastHoles.filter(h => h.status === 'CHARGED').length,
            fired: blast.BlastHoles.filter(h => h.status === 'FIRED').length,
            misfired: blast.BlastHoles.filter(h => h.status === 'MISFIRED').length
        };
    }

    async updateStatus(blastId, newStatus, userId) {
        const transaction = await sequelize.transaction();
        try {
            const blast = await BlastEvent.findOne({
                where: { blast_id: blastId },
                include: [{ model: BlastHole }]
            });

            if (!blast) {
                throw new Error('Blast event not found');
            }

            // Validate status transition
            if (!this.isValidStatusTransition(blast.status, newStatus)) {
                throw new Error(`Invalid status transition from ${blast.status} to ${newStatus}`);
            }

            // Additional validations based on status
            await this.validateStatusChange(blast, newStatus);

            // Update blast status
            await blast.update({
                status: newStatus,
                updated_by: userId,
                blast_time: newStatus === 'COMPLETED' ? new Date() : blast.blast_time
            }, { transaction });

            // If completing the blast, update hole statuses
            if (newStatus === 'COMPLETED') {
                await this.updateHoleStatuses(blast.BlastHoles, 'FIRED', transaction);
            }

            await transaction.commit();
            return this.getBlastEventDetails(blastId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async validateStatusChange(blast, newStatus) {
        if (newStatus === 'CHARGING' && blast.BlastHoles.length === 0) {
            throw new Error('Cannot start charging without blast holes');
        }

        if (newStatus === 'COMPLETED') {
            const unchargedHoles = blast.BlastHoles.filter(h => h.status !== 'CHARGED');
            if (unchargedHoles.length > 0) {
                throw new Error('All holes must be charged before completion');
            }
        }
    }

    async updateHoleStatuses(holes, newStatus, transaction) {
        for (const hole of holes) {
            await hole.update({ status: newStatus }, { transaction });
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['READY'],
            'READY': ['CHARGING'],
            'CHARGING': ['COMPLETED'],
            'COMPLETED': []
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }

    /*async completeBlastEvent(blastId, results, userId) {
        const transaction = await sequelize.transaction();
        try {
            // Update blast status to completed
            await this.updateStatus(blastId, 'COMPLETED', userId);

            // Record blast results
            const blastResult = await BlastResult.create({
                blast_id: blastId,
                fragmentation_quality: results.fragmentation_quality,
                muckpile_shape: results.muckpile_shape,
                throw_distance: results.throw_distance,
                back_break: results.back_break,
                toe_formation: results.toe_formation,
                flyrock_occurrence: results.flyrock_occurrence || false,
                special_observations: results.special_observations,
                photos_url: results.photos_url,
                remarks: results.remarks
            }, { transaction });

            // If any misfired holes reported
            if (results.misfiredHoles && results.misfiredHoles.length > 0) {
                await this.handleMisfiredHoles(
                    blastId, 
                    results.misfiredHoles, 
                    transaction
                );
            }

            await transaction.commit();
            return this.getBlastEventDetails(blastId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/


        /*async completeBlastEvent(blastId, results, userId) {
            const transaction = await sequelize.transaction();
            try {
                // First validate
                const blast = await this.validateBlastForCompletion(blastId);
        
                // Create blast result record
                const blastResult = await BlastResult.create({
                    blast_id: blastId,
                    fragmentation_quality: results.fragmentation_quality,
                    muckpile_shape: results.muckpile_shape,
                    throw_distance: results.throw_distance || null,
                    back_break: results.back_break || null,
                    toe_formation: results.toe_formation || null,
                    flyrock_occurrence: results.flyrock_occurrence || false,
                    special_observations: results.special_observations,
                    photos_url: results.photos_url,
                    remarks: results.remarks
                }, { transaction });
        
                // Update hole statuses
                await Promise.all(blast.BlastHoles.map(hole => 
                    hole.update({
                        status: results.misfiredHoles?.includes(hole.hole_number) ? 
                            'MISFIRED' : 'FIRED'
                    }, { transaction })
                ));
        
                // Update blast event
                await blast.update({
                    status: 'COMPLETED',
                    blast_time: new Date(),
                    updated_by: userId
                }, { transaction });
        
                await transaction.commit();
                return await this.getBlastEventDetails(blastId);
        
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }*/
    
           /* async completeBlastEvent(blastId, results, userId) {
                const transaction = await sequelize.transaction();
                try {
                    const blast = await BlastEvent.findOne({
                        where: { blast_id: blastId },
                        include: [
                            {
                                model: BlastHole,
                                as: 'blastHoles',
                                include: [{ 
                                    model: DrillHole, // Include DrillHole relationship
                                    as: 'drillHole'  
                                }]
                            }
                        ]
                    });
            
                    if (!blast) throw new Error('Blast event not found');
                    if (blast.status !== 'CHARGING') throw new Error('Must be in CHARGING status');
                    
                    // Create blast result
                    await BlastResult.create({
                        blast_id: blastId,
                        fragmentation_quality: results.fragmentation_quality,
                        muckpile_shape: results.muckpile_shape,
                        throw_distance: results.throw_distance || null,
                        back_break: results.back_break || null,
                        toe_formation: results.toe_formation || null,
                        flyrock_occurrence: results.flyrock_occurrence || false,
                        special_observations: results.special_observations,
                        photos_url: results.photos_url,
                        remarks: results.remarks
                    }, { transaction });
            
                    // Update hole statuses
                    for (const blastHole of blast.blastHoles) {
                        const status = results.misfiredHoles?.includes(blastHole.hole_number) ? 'MISFIRED' : 'FIRED';
                        
                        await blastHole.update({ status }, { transaction });
                        
                        // Update corresponding drill hole status to BLASTED
                        if (blastHole.drillHole) {
                            await blastHole.drillHole.update({ 
                                status: 'BLASTED' 
                            }, { transaction });
                        }
                    }
            
                    // Update blast event
                    await blast.update({
                        status: 'COMPLETED',
                        blast_time: new Date(),
                        updated_by: userId
                    }, { transaction });
            
                    await transaction.commit();
                    return await this.getBlastEventDetails(blastId);
            
                } catch (error) {
                    await transaction.rollback();
                    throw error;
                }
            }*/


                async completeBlastEvent(blastId, results, userId) {
                    const transaction = await sequelize.transaction();
                    try {
                        // Get blast with all needed relations in one query
                        const blast = await BlastEvent.findByPk(blastId, {
                            include: [
                                {
                                    model: BlastHole,
                                    as: 'blastHoles',
                                    include: [{ 
                                        model: DrillHole,
                                        as: 'drillHole'
                                    }]
                                },
                                {
                                    model: DrillingSite,
                                    as: 'drillingSite'
                                },
                                {
                                    model: BlastEventExplosive,
                                    as: 'blastEventExplosives'
                                }
                            ]
                        });
                 
                        if (!blast) throw new Error('Blast event not found');
                        if (blast.status !== 'CHARGING') throw new Error('Must be in CHARGING status');
                 
                        // Create blast result
                        await BlastResult.create({
                            blast_id: blastId,
                            fragmentation_quality: results.fragmentation_quality,
                            muckpile_shape: results.muckpile_shape,
                            throw_distance: results.throw_distance || null,
                            back_break: results.back_break || null,
                            toe_formation: results.toe_formation || null,
                            flyrock_occurrence: results.flyrock_occurrence || false,
                            special_observations: results.special_observations,
                            photos_url: results.photos_url,
                            remarks: results.remarks
                        }, { transaction });
                 
                        // Update hole statuses
                        for (const blastHole of blast.blastHoles) {
                            const status = results.misfiredHoles?.includes(blastHole.hole_number) ? 'MISFIRED' : 'FIRED';
                            
                            await blastHole.update({ status }, { transaction });
                            
                            if (blastHole.drillHole) {
                                await blastHole.drillHole.update({ status: 'BLASTED' }, { transaction });
                            }
                        }
                 
                        // Update blast event
                        await blast.update({
                            status: 'COMPLETED',
                            blast_time: new Date(),
                            updated_by: userId
                        }, { transaction });
                 
                        await transaction.commit();
                        return blast.toJSON(); // Return the existing blast data without another query
                 
                    } catch (error) {
                        if (!transaction.finished) await transaction.rollback();
                        throw error;
                    }
                 }
    
    async handleMisfiredHoles(blastId, misfiredHoles, transaction) {
        // Update status of misfired holes
        for (const holeNumber of misfiredHoles) {
            const hole = await BlastHole.findOne({
                where: { 
                    blast_id: blastId,
                    hole_number: holeNumber
                }
            });

            if (hole) {
                await hole.update({
                    status: 'MISFIRED',
                    remarks: 'Misfire reported during blast completion'
                }, { transaction });
            }
        }
    }


    async validateBlastForCompletion(blastId) {
        const blast = await BlastEvent.findOne({
            where: { blast_id: blastId },
            include: [{
                model: BlastHole,
                as: 'blastHoles',
                attributes: ['blast_hole_id', 'status']
            }]
        });
    
        if (!blast) {
            throw new Error('Blast event not found');
        }
    
        if (blast.status !== 'CHARGING') {
            throw new Error('Blast must be in CHARGING status to complete');
        }
    
        const unchargedHoles = blast.BlastHoles.filter(hole => 
            hole.status !== 'CHARGED'
        );
    
        if (unchargedHoles.length > 0) {
            throw new Error(`${unchargedHoles.length} holes are not in CHARGED status`);
        }
    
        return blast;
    }



    async updatePatternSketch(blastId, file, userId) {
        const transaction = await sequelize.transaction();
        try {
            const blastEvent = await BlastEvent.findOne({
                where: { 
                    blast_id: blastId,
                    is_active: true
                }
            });
    
            if (!blastEvent) {
                throw new Error('Blast event not found');
            }
    
            // Delete old pattern sketch if exists
            if (blastEvent.pattern_sketch_url) {
                const oldFilePath = path.join(process.cwd(), blastEvent.pattern_sketch_url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
    
            // Update pattern sketch URL
            const pattern_sketch_url = file.path.replace(/\\/g, '/'); // Convert Windows path to URL format
            await blastEvent.update({
                pattern_sketch_url,
                updated_by: userId
            }, { transaction });
    
            await transaction.commit();
            return blastEvent;
    
        } catch (error) {
            await transaction.rollback();
            // Delete uploaded file if error occurs
            if (file && file.path) {
                fs.unlinkSync(file.path);
            }
            throw error;
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



async getBlastCompletionSummary(blastId) {
    const summary = await BlastEvent.findOne({
        where: { blast_id: blastId },
        include: [
            {
                model: BlastResult,
                as: 'blastResult',
                required: true
            },
            {
                model: BlastHole,
                as: 'blastHoles',
                attributes: ['status'],
            },
            {
                model: DrillingSite,
                as: 'drillingSite',
                attributes: ['bench_id', 'rock_type']
            }
        ]
    });

    const holeStats = {
        total: summary.blastHoles.length,
        fired: summary.blastHoles.filter(h => h.status === 'FIRED').length,
        misfired: summary.blastHoles.filter(h => h.status === 'MISFIRED').length
    };

    return {
        blast: {
            id: summary.blast_id,
            completionTime: summary.blast_time,
            location: summary.drillingSite.bench_id,
            rockType: summary.drillingSite.rock_type
        },
        holes: holeStats,
        results: {
            fragmentation: summary.blastResult.fragmentation_quality,
            muckpile: summary.blastResult.muckpile_shape,
            safety: {
                flyrock: summary.blastResult.flyrock_occurrence,
                backBreak: summary.blastResult.back_break
            }
        }
    };
}



}

module.exports = new BlastEventService();





