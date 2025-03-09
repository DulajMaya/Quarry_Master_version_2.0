// services/daily-blast-explosive.service.js
const { 
    DailyBlastExplosive, 
    DailyBlastOperation,
    ExplosiveType,
    ExplosiveIssuance,
    InventoryMovement,
    StoreInventory
} = require('../models');
const sequelize = require('../config/db.config');

class DailyBlastExplosiveService {
    async createExplosiveAllocation(data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting explosive allocation:', {
                dailyBlastId: data.daily_blast_id,
                explosiveTypeId: data.explosive_type_id
            });

            // Check if allocation already exists
            const existingAllocation = await DailyBlastExplosive.findOne({
                where: {
                    daily_blast_id: data.daily_blast_id,
                    explosive_type_id: data.explosive_type_id
                }
            });

            if (existingAllocation) {
                throw new Error('Explosive allocation already exists');
            }

            // Create explosive allocation
            const allocation = await DailyBlastExplosive.create({
                ...data,
                created_by: data.userId
            }, { transaction });

            // Create inventory movement
            await InventoryMovement.create({
                InventoryID: data.explosive_type_id,
                MovementType: 'OUT',
                Quantity: data.quantity_issued,
                ReferenceType: 'Blasting',
                ReferenceID: allocation.daily_blast_explosive_id,
                CreatedBy: data.userId
            }, { transaction });

            await transaction.commit();
            return allocation;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in createExplosiveAllocation:', error);
            throw error;
        }
    }

    async updateExplosiveUsage(daily_blast_explosive_id, data) {
        const transaction = await sequelize.transaction();
        try {
            const allocation = await DailyBlastExplosive.findByPk(daily_blast_explosive_id);
            if (!allocation) {
                throw new Error('Explosive allocation not found');
            }

            // Validate quantities
            const totalQuantity = parseFloat(data.quantity_used) + parseFloat(data.quantity_returned);
            if (totalQuantity > allocation.quantity_issued) {
                throw new Error('Total of used and returned quantity exceeds issued quantity');
            }

            // Update allocation
            await allocation.update({
                quantity_used: data.quantity_used,
                quantity_returned: data.quantity_returned,
                status: this.calculateStatus(data.quantity_used, data.quantity_returned, allocation.quantity_issued),
                remarks: data.remarks
            }, { transaction });

            // Create return movement if any
            if (data.quantity_returned > 0) {
                await InventoryMovement.create({
                    InventoryID: allocation.explosive_type_id,
                    MovementType: 'IN',
                    Quantity: data.quantity_returned,
                    ReferenceType: 'Return',
                    ReferenceID: daily_blast_explosive_id,
                    CreatedBy: data.userId
                }, { transaction });
            }

            await transaction.commit();
            return allocation;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateExplosiveUsage:', error);
            throw error;
        }
    }

    calculateStatus(used, returned, issued) {
        const total = parseFloat(used) + parseFloat(returned);
        if (total === 0) return 'ISSUED';
        if (total < issued) return 'PARTIALLY_USED';
        if (total === issued) return 'COMPLETED';
        throw new Error('Invalid quantities');
    }

    async getDailyExplosives(daily_blast_id) {
        try {
            return await DailyBlastExplosive.findAll({
                where: { daily_blast_id },
                include: [{
                    model: ExplosiveType,
                    as: 'explosiveType'
                }]
            });
        } catch (error) {
            console.error('Error in getDailyExplosives:', error);
            throw error;
        }
    }

    async getDailyExplosiveSummary(daily_blast_id) {
        try {
            const explosives = await this.getDailyExplosives(daily_blast_id);
            
            return explosives.map(exp => ({
                type: exp.explosiveType.TypeName,
                issued: exp.quantity_issued,
                used: exp.quantity_used || 0,
                returned: exp.quantity_returned || 0,
                remaining: exp.quantity_issued - (exp.quantity_used || 0) - (exp.quantity_returned || 0),
                status: exp.status
            }));
        } catch (error) {
            console.error('Error in getDailyExplosiveSummary:', error);
            throw error;
        }
    }
}

module.exports = new DailyBlastExplosiveService();