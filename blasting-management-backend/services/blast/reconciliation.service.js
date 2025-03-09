// services/blast/reconciliation.service.js
const { 
    ExplosiveAllocation,
    BlastHoleExplosive,
    BlastEvent,
    InventoryMovement
 } = require('../../models');
 
 class ReconciliationService {
    async validateDailyUsage(daily_blast_id) {
        const allocation = await ExplosiveAllocation.findOne({
            where: { daily_blast_id },
            include: ['items']
        });
 
        const usage = await this.calculateActualUsage(daily_blast_id);
        const discrepancies = [];
 
        for (const item of allocation.items) {
            const used = usage[item.explosive_type_id] || 0;
            const total = item.quantity_used + item.quantity_returned + item.quantity_wasted;
            
            if (Math.abs(used - item.quantity_used) > 0.01) {
                discrepancies.push({
                    explosive_type_id: item.explosive_type_id,
                    recorded: item.quantity_used,
                    actual: used,
                    difference: used - item.quantity_used
                });
            }
        }
 
        return {
            isValid: discrepancies.length === 0,
            discrepancies
        };
    }
 
    async calculateActualUsage(daily_blast_id) {
        const events = await BlastEvent.findAll({
            where: { daily_blast_id }
        });
 
        const usage = {};
        for (const event of events) {
            const explosives = await BlastHoleExplosive.findAll({
                where: { 
                    blast_id: event.blast_id,
                    status: 'CHARGED'
                },
                attributes: [
                    'explosive_type_id',
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
                ],
                group: ['explosive_type_id']
            });
 
            explosives.forEach(exp => {
                const total = Number(exp.getDataValue('total'));
                usage[exp.explosive_type_id] = (usage[exp.explosive_type_id] || 0) + total;
            });
        }
 
        return usage;
    }
 
    async generateDailyReport(daily_blast_id) {
        const allocation = await ExplosiveAllocation.findOne({
            where: { daily_blast_id },
            include: [
                'items',
                { 
                    model: BlastEvent,
                    include: ['holes']
                }
            ]
        });
 
        const usage = await this.calculateActualUsage(daily_blast_id);
 
        return {
            date: allocation.issue_date,
            total_blasts: allocation.BlastEvents.length,
            total_holes: allocation.BlastEvents.reduce((sum, event) => 
                sum + event.holes.length, 0
            ),
            explosives: allocation.items.map(item => ({
                type_id: item.explosive_type_id,
                issued: item.quantity_issued,
                used: usage[item.explosive_type_id] || 0,
                returned: item.quantity_returned,
                wasted: item.quantity_wasted
            }))
        };
    }
 }
 
 module.exports = new ReconciliationService();