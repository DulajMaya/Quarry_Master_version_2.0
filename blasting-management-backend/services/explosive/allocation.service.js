// services/explosive/allocation.service.js
const { 
    ExplosiveAllocation, 
    ExplosiveAllocationItem, 
    StoreInventory,
    InventoryMovement,
    DailyBlastOperation 
} = require('../../models');
const sequelize = require('../../config/db.config');

class ExplosiveAllocationService {
    async createAllocation(data) {
        const transaction = await sequelize.transaction();
        try {
            // Validate daily operation status
            const operation = await DailyBlastOperation.findOne({
                where: { 
                    daily_blast_id: data.daily_blast_id,
                    status: 'PLANNED'
                }
            });

            if (!operation) {
                throw new Error('Invalid operation status for allocation');
            }

            // Create allocation
            const allocation = await ExplosiveAllocation.create({
                daily_blast_id: data.daily_blast_id,
                store_id: data.store_id,
                issue_date: new Date(),
                created_by: data.userId
            }, { transaction });

            // Create allocation items
            await Promise.all(data.items.map(async item => {
                // Validate inventory
                const inventory = await StoreInventory.findOne({
                    where: {
                        StoreID: data.store_id,
                        ExplosiveTypeID: item.explosive_type_id
                    }
                });

                if (!inventory || inventory.CurrentQuantity < item.quantity_requested) {
                    throw new Error(`Insufficient inventory for ${item.explosive_type_id}`);
                }

                return ExplosiveAllocationItem.create({
                    allocation_id: allocation.allocation_id,
                    explosive_type_id: item.explosive_type_id,
                    quantity_requested: item.quantity_requested
                }, { transaction });
            }));

            await operation.update({ 
                status: 'EXPLOSIVES_REQUESTED' 
            }, { transaction });

            await transaction.commit();
            return allocation;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async approveAllocation(allocation_id, data) {
        const transaction = await sequelize.transaction();
        try {
            const allocation = await ExplosiveAllocation.findOne({
                where: { allocation_id },
                include: ['items']
            });

            if (allocation.status !== 'REQUESTED') {
                throw new Error('Invalid allocation status');
            }

            // Process each item
            await Promise.all(allocation.items.map(async item => {
                const approvedQty = data.items.find(
                    i => i.item_id === item.item_id
                )?.quantity_issued;

                if (approvedQty) {
                    await item.update({ 
                        quantity_issued: approvedQty 
                    }, { transaction });

                    // Create inventory movement
                    await InventoryMovement.create({
                        InventoryID: item.explosive_type_id,
                        MovementType: 'OUT',
                        Quantity: approvedQty,
                        ReferenceType: 'Allocation',
                        ReferenceID: allocation_id,
                        CreatedBy: data.userId
                    }, { transaction });
                }
            }));

            await allocation.update({ 
                status: 'ISSUED' 
            }, { transaction });

            await transaction.commit();
            return allocation;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async processReturn(allocation_id, return_data) {
        const transaction = await sequelize.transaction();
        try {
            const allocation = await ExplosiveAllocation.findOne({
                where: { allocation_id },
                include: ['items']
            });

            if (!['ISSUED', 'PARTIALLY_RETURNED'].includes(allocation.status)) {
                throw new Error('Invalid allocation status for return');
            }

            // Process returns
            await Promise.all(return_data.items.map(async returnItem => {
                const item = allocation.items.find(
                    i => i.item_id === returnItem.item_id
                );

                if (!item) throw new Error('Invalid item');

                const totalAccounted = 
                    Number(returnItem.quantity_used || 0) +
                    Number(returnItem.quantity_returned || 0) +
                    Number(returnItem.quantity_wasted || 0);

                if (totalAccounted > item.quantity_issued) {
                    throw new Error('Total quantities exceed issued amount');
                }

                await item.update({
                    quantity_used: returnItem.quantity_used,
                    quantity_returned: returnItem.quantity_returned,
                    quantity_wasted: returnItem.quantity_wasted
                }, { transaction });

                if (returnItem.quantity_returned > 0) {
                    await InventoryMovement.create({
                        InventoryID: item.explosive_type_id,
                        MovementType: 'IN',
                        Quantity: returnItem.quantity_returned,
                        ReferenceType: 'Return',
                        ReferenceID: allocation_id,
                        CreatedBy: return_data.userId
                    }, { transaction });
                }
            }));

            // Update allocation status
            const allItems = await ExplosiveAllocationItem.findAll({
                where: { allocation_id }
            });

            const isComplete = allItems.every(item => 
                (Number(item.quantity_used) + 
                Number(item.quantity_returned) + 
                Number(item.quantity_wasted)) === Number(item.quantity_issued)
            );

            await allocation.update({
                status: isComplete ? 'COMPLETED' : 'PARTIALLY_RETURNED',
                return_date: new Date(),
                remarks: return_data.remarks
            }, { transaction });

            await transaction.commit();
            return allocation;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

module.exports = new ExplosiveAllocationService();