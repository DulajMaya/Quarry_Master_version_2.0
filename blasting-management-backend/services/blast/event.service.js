// services/blast/event.service.js
const { 
    BlastEvent, 
    ExplosiveAllocation,
    ExplosiveAllocationItem,
    BlastHoleExplosive 
 } = require('../../models');
 
 class BlastEventService {
    async createBlastEvent(data) {
        const transaction = await sequelize.transaction();
        try {
            // Verify allocation exists and is active
            const allocation = await ExplosiveAllocation.findOne({
                where: { 
                    daily_blast_id: data.daily_blast_id,
                    status: 'ISSUED'
                }
            });
 
            if (!allocation) {
                throw new Error('No active explosive allocation found');
            }
 
            const event = await BlastEvent.create({
                ...data,
                status: 'PLANNED',
                created_by: data.userId
            }, { transaction });
 
            // Pre-validate explosive quantities if provided
            if (data.explosives) {
                await this.validateExplosiveQuantities(
                    event.blast_id,
                    data.explosives,
                    allocation,
                    transaction
                );
            }
 
            await transaction.commit();
            return event;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
 
    async validateExplosiveQuantities(blast_id, explosives, allocation, transaction) {
        const allocationItems = await ExplosiveAllocationItem.findAll({
            where: { allocation_id: allocation.allocation_id }
        });
 
        // Check each explosive type
        for (const explosive of explosives) {
            const allocated = allocationItems.find(
                item => item.explosive_type_id === explosive.explosive_type_id
            );
 
            if (!allocated) {
                throw new Error(`Explosive type ${explosive.explosive_type_id} not allocated`);
            }
 
            const usedQuantity = await this.calculateUsedQuantity(
                allocation.daily_blast_id,
                explosive.explosive_type_id
            );
 
            const availableQuantity = allocated.quantity_issued - usedQuantity;
 
            if (explosive.planned_quantity > availableQuantity) {
                throw new Error(
                    `Planned quantity ${explosive.planned_quantity} exceeds available quantity ${availableQuantity}`
                );
            }
        }
 
        return true;
    }
 
    async calculateUsedQuantity(daily_blast_id, explosive_type_id) {
        const usage = await BlastHoleExplosive.sum('quantity', {
            where: { explosive_type_id },
            include: [{
                model: BlastEvent,
                where: { daily_blast_id }
            }]
        });
 
        return Number(usage || 0);
    }
 
    async recordExplosiveUsage(blast_id, hole_data) {
        const transaction = await sequelize.transaction();
        try {
            const event = await BlastEvent.findByPk(blast_id, {
                include: ['dailyOperation']
            });
 
            if (!event || event.status !== 'CHARGING') {
                throw new Error('Invalid blast event status');
            }
 
            // Record hole explosives
            for (const hole of hole_data) {
                await BlastHoleExplosive.create({
                    blast_id,
                    hole_id: hole.hole_id,
                    explosive_type_id: hole.explosive_type_id,
                    quantity: hole.quantity,
                    charging_sequence: hole.charging_sequence,
                    created_by: hole.userId
                }, { transaction });
            }
 
            // Update event status if all holes charged
            const isComplete = await this.checkChargingComplete(blast_id);
            if (isComplete) {
                await event.update({ status: 'CHARGED' }, { transaction });
            }
 
            await transaction.commit();
            return event;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
 }
 
 module.exports = new BlastEventService();