// services/blast/hole-explosive.service.js
const { 
    BlastHoleExplosive,
    BlastEvent,
    ExplosiveAllocation 
 } = require('../../models');
 
 class BlastHoleExplosiveService {
    async recordCharging(data) {
        const transaction = await sequelize.transaction();
        try {
            const event = await BlastEvent.findOne({
                where: { blast_id: data.blast_id },
                include: [{
                    model: ExplosiveAllocation,
                    where: { status: 'ISSUED' }
                }]
            });
 
            if (!event || event.status !== 'CHARGING') {
                throw new Error('Invalid blast event status');
            }
 
            const chargeData = await BlastHoleExplosive.create({
                blast_hole_id: data.blast_hole_id,
                explosive_type_id: data.explosive_type_id,
                quantity: data.quantity,
                charging_sequence: data.charging_sequence,
                status: 'CHARGED',
                created_by: data.userId
            }, { transaction });
 
            await this.validateAllocationQuantity(
                event.ExplosiveAllocation.allocation_id,
                data.explosive_type_id,
                data.quantity,
                transaction
            );
 
            await transaction.commit();
            return chargeData;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
 
    async validateAllocationQuantity(allocation_id, explosive_type_id, new_quantity) {
        const allocation = await ExplosiveAllocationItem.findOne({
            where: { 
                allocation_id,
                explosive_type_id
            }
        });
 
        const totalUsed = await this.calculateTotalUsed(
            allocation_id, 
            explosive_type_id
        );
 
        if ((totalUsed + new_quantity) > allocation.quantity_issued) {
            throw new Error('Exceeds allocated quantity');
        }
 
        return true;
    }
 
    async calculateTotalUsed(allocation_id, explosive_type_id) {
        const used = await BlastHoleExplosive.sum('quantity', {
            where: { 
                explosive_type_id,
                status: 'CHARGED'
            },
            include: [{
                model: BlastEvent,
                where: { allocation_id }
            }]
        });
 
        return Number(used || 0);
    }
 
    async getHoleChargeDetails(blast_hole_id) {
        return await BlastHoleExplosive.findAll({
            where: { blast_hole_id },
            include: ['explosiveType']
        });
    }
 }
 
 module.exports = new BlastHoleExplosiveService();