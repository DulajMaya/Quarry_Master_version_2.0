// services/explosive-issuance.service.js
const { 
    ExplosiveIssuance, 
    ExplosiveIssuanceItem,
    DailyBlastOperation,
    ExplosiveStore,
    ExplosiveType,
    BlastEvent,
    BlastHoleExplosive,
    StoreInventory,
    BlastHole,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const storeInventoryService = require('./store-inventory.service');
const { generateInventoryId, generateBulkMovementIds } = require('../services/id-generator.service');


class ExplosiveIssuanceService {




    /*async createIssuance(data) {
        const transaction = await sequelize.transaction();
        try {
            // Validate daily blast operation
            const dailyOperation = await DailyBlastOperation.findOne({
                where: {
                    daily_blast_id: data.daily_blast_id,
                    is_active: true
                }
            });

            if (!dailyOperation) {
                throw new Error('Daily blast operation not found or inactive');
            }

            // Generate issuance ID (Format: ISU-YYYYMMDD-XXX)
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            const sequence = await this.getNextSequenceNumber(dateStr);
            const issuanceId = `ISU-${dateStr}-${sequence.toString().padStart(3, '0')}`;

            // Check inventory availability for all items
            for (const item of data.items) {
                const inventory = await StoreInventory.findOne({
                    where: {
                        StoreID: data.store_id,
                        ExplosiveTypeID: item.explosive_type_id,
                        Status: {
                            [Op.ne]: 'OutOfStock'
                        }
                    }
                });

                if (!inventory || inventory.CurrentQuantity < item.quantity_issued) {
                    throw new Error(`Insufficient stock for explosive type ${item.explosive_type_id}`);
                }
            }

            // Create main issuance record
            const issuance = await ExplosiveIssuance.create({
                issuance_id: issuanceId,
                daily_blast_id: data.daily_blast_id,
                store_id: data.store_id,
                issuance_date: today,
                purpose: data.purpose,
                status: 'ISSUED',
                created_by: data.userId
            }, { transaction });

            // Process each explosive item
            for (const item of data.items) {
                // Create issuance item
                const itemId = `ISUITEM-${dateStr}-${sequence.toString().padStart(3, '0')}`;
                await ExplosiveIssuanceItem.create({
                    issuance_item_id: itemId,
                    issuance_id: issuanceId,
                    explosive_type_id: item.explosive_type_id,
                    batch_number: item.batch_number,
                    quantity_issued: item.quantity_issued,
                    created_by: data.userId
                }, { transaction });

                // Update inventory
                await storeInventoryService.updateInventory(
                    item.inventory_id,
                    item.quantity_issued,
                    'OUT',
                    {
                        type: 'Issuance',
                        id: issuanceId,
                        batchNumber: item.batch_number,
                        remarks: `Issued for daily blast operation ${data.daily_blast_id}`
                    },
                    data.userId,
                    transaction
                );
            }

            await transaction.commit();
            return await this.getIssuanceDetails(issuanceId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/



       /* async createIssuance(data) {
            try {
                // Validate daily blast operation first
                const dailyOperation = await DailyBlastOperation.findOne({
                    where: {
                        daily_blast_id: data.daily_blast_id,
                        is_active: true
                    }
                });
        
                if (!dailyOperation) {
                    throw new Error('Daily blast operation not found or inactive');
                }
        
                // Generate all necessary IDs before starting transaction
                const today = new Date();
                const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                const sequence = await this.getNextSequenceNumber(dateStr);
                
                // Generate main issuance ID
                const issuanceId = `ISU-${dateStr}-${sequence.toString().padStart(3, '0')}`;
                
                // Pre-generate all item IDs
                const itemIds = await this.generateBulkItemIds(data.items.length, dateStr);
        
                // Validate inventory availability
                await this.validateInventoryAvailability(data.store_id, data.items);
        
                // Start transaction after all validations and ID generation
                const transaction = await sequelize.transaction();
                
                try {
                    // Create main issuance record
                    const issuance = await ExplosiveIssuance.create({
                        issuance_id: issuanceId,
                        daily_blast_id: data.daily_blast_id,
                        store_id: data.store_id,
                        issuance_date: today,
                        purpose: data.purpose,
                        status: 'ISSUED',
                        created_by: data.userId
                    }, { transaction });
        
                    // Process each explosive item with pre-generated IDs
                    await Promise.all(data.items.map(async (item, index) => {
                        // Create issuance item using pre-generated ID
                        await ExplosiveIssuanceItem.create({
                            issuance_item_id: itemIds[index],
                            issuance_id: issuanceId,
                            explosive_type_id: item.explosive_type_id,
                            batch_number: item.batch_number,
                            quantity_issued: item.quantity_issued,
                            created_by: data.userId
                        }, { transaction });
        
                        // Update inventory


                        // In explosive-issuance.service.js
                        const movementIds = await generateBulkMovementIds(data.items.length);

                        // Inside your transaction
                            await storeInventoryService.updateInventory(
                                item.inventory_id,
                                item.quantity_issued,
                                'OUT',
                                {
                                    type: 'Issuance',
                                    id: issuanceId,
                                    batchNumber: item.batch_number,
                                    remarks: `Issued for daily blast operation ${data.daily_blast_id}`
                                },
                                data.userId,
                                transaction  // Pass the transaction
                            );
                        }));





                        /*await storeInventoryService.updateInventory(
                            item.inventory_id,
                            item.quantity_issued,
                            'OUT',
                            {
                                type: 'Issuance',
                                id: issuanceId,
                                batchNumber: item.batch_number,
                                remarks: `Issued for daily blast operation ${data.daily_blast_id}`
                            },
                            data.userId,
                            transaction
                        );
                    }));*
        
                    await transaction.commit();
                    return await this.getIssuanceDetails(issuanceId);
        
                } catch (error) {
                    await transaction.rollback();
                    throw error;
                }
            } catch (error) {
                throw error;
            }
        }*/



            async createIssuance(data) {
                try {
                    // Validate daily blast operation first
                    const dailyOperation = await DailyBlastOperation.findOne({
                        where: {
                            daily_blast_id: data.daily_blast_id,
                            is_active: true
                        }
                    });
            
                    if (!dailyOperation) {
                        throw new Error('Daily blast operation not found or inactive');
                    }
            
                    // Generate main issuance ID and validate inventory before transaction
                    const today = new Date();
                    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                    const sequence = await this.getNextSequenceNumber(dateStr);
                    const issuanceId = `ISU-${dateStr}-${sequence.toString().padStart(3, '0')}`;
                    const itemIds = await this.generateBulkItemIds(data.items.length, dateStr);
                    
                    await this.validateInventoryAvailability(data.store_id, data.items);
            
                    // Start transaction
                    const transaction = await sequelize.transaction();
                    
                    try {
                        // Create main issuance record
                        const issuance = await ExplosiveIssuance.create({
                            issuance_id: issuanceId,
                            daily_blast_id: data.daily_blast_id,
                            store_id: data.store_id,
                            issuance_date: today,
                            purpose: data.purpose,
                            status: 'ISSUED',
                            created_by: data.userId
                        }, { transaction });
            
                        // Process items SERIALLY to avoid race conditions
                        for (let i = 0; i < data.items.length; i++) {
                            const item = data.items[i];
                            
                            // Create issuance item using pre-generated ID
                            await ExplosiveIssuanceItem.create({
                                issuance_item_id: itemIds[i],
                                issuance_id: issuanceId,
                                explosive_type_id: item.explosive_type_id,
                                batch_number: item.batch_number,
                                quantity_issued: item.quantity_issued,
                                created_by: data.userId
                            }, { transaction });
            
                            // Update inventory - each operation gets its own movement ID
                            await storeInventoryService.updateInventory(
                                item.inventory_id,
                                item.quantity_issued,
                                'OUT',
                                {
                                    type: 'Issuance',
                                    id: issuanceId,
                                    batchNumber: item.batch_number,
                                    remarks: `Issued for daily blast operation ${data.daily_blast_id}`
                                },
                                data.userId,
                                transaction
                            );
                        }
            
                        await transaction.commit();
                        return await this.getIssuanceDetails(issuanceId);
            
                    } catch (error) {
                        await transaction.rollback();
                        throw error;
                    }
                } catch (error) {
                    throw error;
                }
            }












        
        // New helper methods for ID generation and validation
        
        async generateBulkItemIds(count, dateStr) {
            const baseSequence = await this.getNextItemSequenceNumber(dateStr);
            const itemIds = [];
            
            for (let i = 0; i < count; i++) {
                const sequenceNum = baseSequence + i;
                itemIds.push(`ISUITEM-${dateStr}-${sequenceNum.toString().padStart(3, '0')}`);
            }
            
            return itemIds;
        }
        
        async getNextItemSequenceNumber(dateStr) {
            const lastItem = await ExplosiveIssuanceItem.findOne({
                where: {
                    issuance_item_id: {
                        [Op.like]: `ISUITEM-${dateStr}-%`
                    }
                },
                order: [['issuance_item_id', 'DESC']]
            });
        
            if (!lastItem) return 1;
        
            const lastSequence = parseInt(lastItem.issuance_item_id.split('-')[2]);
            return lastSequence + 1;
        }
        
        async validateInventoryAvailability(storeId, items) {
            for (const item of items) {
                const inventory = await StoreInventory.findOne({
                    where: {
                        StoreID: storeId,
                        ExplosiveTypeID: item.explosive_type_id,
                        Status: {
                            [Op.ne]: 'OutOfStock'
                        }
                    }
                });
        
                if (!inventory || inventory.CurrentQuantity < item.quantity_issued) {
                    throw new Error(`Insufficient stock for explosive type ${item.explosive_type_id}`);
                }
            }
        }




    

    /*async recordReturn(data) {
        const transaction = await sequelize.transaction();
        try {
            const { issuanceId, items } = data;

            const issuance = await ExplosiveIssuance.findOne({
                where: { issuance_id: issuanceId }
            });

            if (!issuance) {
                throw new Error('Issuance record not found');
            }

            // Get actual usage from blast holes
            const usageData = await this.getActualUsageData(issuance.daily_blast_id);

            for (const item of items) {
                const issuanceItem = await ExplosiveIssuanceItem.findOne({
                    where: {
                        issuance_id: issuanceId,
                        explosive_type_id: item.explosive_type_id
                    }
                });

                if (!issuanceItem) {
                    throw new Error(`Issuance item not found for explosive type ${item.explosive_type_id}`);
                }

                const actualUsed = usageData[item.explosive_type_id] || 0;
                const totalReturned = parseFloat(item.quantity_returned || 0);
                const totalDamaged = parseFloat(item.quantity_damaged || 0);
                const totalWasted = parseFloat(item.quantity_wasted || 0);

                // Verify reconciliation
                const totalAccounted = actualUsed + totalReturned + totalDamaged + totalWasted;
                if (Math.abs(totalAccounted - issuanceItem.quantity_issued) > 0.01) {
                    throw new Error(`Unbalanced quantities for explosive type ${item.explosive_type_id}. 
                        Issued: ${issuanceItem.quantity_issued}, 
                        Used: ${actualUsed}, 
                        Returned: ${totalReturned}, 
                        Damaged: ${totalDamaged}, 
                        Wasted: ${totalWasted}`);
                }

                // Update issuance item
                await issuanceItem.update({
                    quantity_used: actualUsed,
                    quantity_returned: totalReturned,
                    quantity_damaged: totalDamaged,
                    quantity_wasted: totalWasted,
                    damage_reason: item.damage_reason,
                    waste_reason: item.waste_reason,
                    reconciliation_status: 'BALANCED'
                }, { transaction });

                // Update inventory for returns if any
                if (totalReturned > 0) {
                    await storeInventoryService.updateInventory(
                        item.inventory_id,
                        totalReturned,
                        'IN',
                        {
                            type: 'Return',
                            id: issuanceId,
                            batchNumber: issuanceItem.batch_number,
                            remarks: `Returned from blast operation ${issuance.daily_blast_id}`
                        },
                        data.userId,
                        transaction
                    );
                }
            }

            // Update issuance status
            await issuance.update({
                status: 'COMPLETED',
                completion_date: new Date()
            }, { transaction });

            await transaction.commit();
            return await this.getIssuanceDetails(issuanceId);

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/

    
       /* async validateReturnRequest(issuanceId, returnData) {
            const preview = await this.generateReturnPreview(issuanceId);
            
            const errors = [];
            const validatedItems = [];
        
            for (const item of returnData.items) {
                const previewItem = preview.items.find(p => p.explosive_type_id === item.explosive_type_id);
                
                if (!previewItem) {
                    errors.push(`Invalid explosive type: ${item.explosive_type_id}`);
                    continue;
                }
        
                const totalReturn = parseFloat(item.quantity_returned || 0) + 
                                  parseFloat(item.quantity_damaged || 0) + 
                                  parseFloat(item.quantity_wasted || 0);
        
                if (totalReturn > previewItem.quantity_available) {
                    errors.push(`Return quantity exceeds available for ${previewItem.explosive_name}`);
                    continue;
                }
        
                validatedItems.push({
                    ...item,
                    previewQuantity: previewItem.quantity_available
                });
            }
        
            return { isValid: errors.length === 0, errors, validatedItems };
        }*/

            async validateReturnRequest(issuanceId, returnData) {
                const preview = await this.generateReturnPreview(issuanceId);
                
                const inventoryIds = [...new Set(returnData.items.map(i => i.inventory_id))];
                const inventories = await StoreInventory.findAll({
                    where: { 
                        InventoryID: inventoryIds,
                        Status: { [Op.ne]: 'OutOfStock' }
                    }
                });
             
                const validInventoryIds = new Set(inventories.map(i => i.InventoryID));
                const errors = [];
                const validatedItems = [];
             
                // Group return items by explosive type
                const returnByType = returnData.items.reduce((acc, item) => {
                    if (!acc[item.explosive_type_id]) {
                        acc[item.explosive_type_id] = {
                            quantity_returned: 0,
                            quantity_damaged: 0,
                            quantity_wasted: 0,
                            items: []
                        };
                    }
                    acc[item.explosive_type_id].quantity_returned += parseFloat(item.quantity_returned || 0);
                    acc[item.explosive_type_id].quantity_damaged += parseFloat(item.quantity_damaged || 0);
                    acc[item.explosive_type_id].quantity_wasted += parseFloat(item.quantity_wasted || 0);
                    acc[item.explosive_type_id].items.push(item);
                    return acc;
                }, {});
             
                // Validate totals against available quantities
                for (const [explosiveTypeId, returnGroup] of Object.entries(returnByType)) {
                    const previewItems = preview.items.filter(p => p.explosive_type_id === explosiveTypeId);
                    const totalAvailable = previewItems.reduce((sum, item) => sum + item.quantity_available, 0);
                    
                    const totalReturn = returnGroup.quantity_returned + 
                                      returnGroup.quantity_damaged + 
                                      returnGroup.quantity_wasted;
             
                    if (totalReturn > totalAvailable) {
                        errors.push(`Return quantity ${totalReturn} exceeds available ${totalAvailable} for type ${explosiveTypeId}`);
                        continue;
                    }
             
                    // Validate inventories
                    for (const item of returnGroup.items) {
                        if (!validInventoryIds.has(item.inventory_id)) {
                            errors.push(`Invalid or inactive inventory: ${item.inventory_id}`);
                            continue;
                        }
             
                        const inventory = inventories.find(i => i.InventoryID === item.inventory_id);
                        if (inventory.ExplosiveTypeID !== item.explosive_type_id) {
                            errors.push(`Inventory ${item.inventory_id} does not match explosive type ${item.explosive_type_id}`);
                            continue;
                        }
             
                        validatedItems.push({
                            ...item,
                            inventory
                        });
                    }
                }
             
                return { isValid: errors.length === 0, errors, validatedItems };
             }


        async recordReturn(issuanceId, returnData) {
            const validation = await this.validateReturnRequest(issuanceId, returnData);
            if (!validation.isValid) {
                throw new Error(`Invalid return request: ${validation.errors.join(', ')}`);
            }
         
            const transaction = await sequelize.transaction();
            try {
                const issuance = await ExplosiveIssuance.findOne({
                    where: { issuance_id: issuanceId },
                    include: [{ model: ExplosiveIssuanceItem }],
                    transaction
                });
         
                for (const item of returnData.items) {
                    const issuanceItem = issuance.ExplosiveIssuanceItems.find(
                        i => i.explosive_type_id === item.explosive_type_id
                    );
         
                    await issuanceItem.update({
                        quantity_returned: parseFloat(item.quantity_returned || 0),
                        quantity_damaged: parseFloat(item.quantity_damaged || 0),
                        quantity_wasted: parseFloat(item.quantity_wasted || 0),
                        damage_reason: item.damage_reason,
                        waste_reason: item.waste_reason,
                        reconciliation_status: 'BALANCED'
                    }, { transaction });
         
                    if (item.quantity_returned > 0) {
                        await storeInventoryService.updateInventory(
                            item.inventory_id,
                            item.quantity_returned,
                            'IN',
                            {
                                type: 'Return',
                                id: issuanceId,
                                batchNumber: issuanceItem.batch_number,
                                remarks: `Returned from daily blast ${issuance.daily_blast_id}`
                            },
                            returnData.userId,
                            transaction
                        );
                    }
                }
         
                await issuance.update({
                    status: 'COMPLETED',
                    completion_date: new Date()
                }, { transaction });
         
                await transaction.commit();
                return await this.getIssuanceDetails(issuanceId);
         
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
         }




    async getActualUsageData(dailyBlastId) {
        // Get all blast holes explosives used in this daily operation
        const blastHolesUsage = await BlastHoleExplosive.findAll({
            include: [{
                model: BlastHole,
                include: [{
                    model: BlastEvent,
                    where: { daily_blast_id: dailyBlastId }
                }]
            }]
        });

        // Sum up quantities by explosive type
        return blastHolesUsage.reduce((acc, usage) => {
            const explosiveTypeId = usage.explosive_type_id;
            acc[explosiveTypeId] = (acc[explosiveTypeId] || 0) + parseFloat(usage.quantity);
            return acc;
        }, {});
    }

    async calculateUnbalancedQuantities(issuanceId) {
        const issuance = await this.getIssuanceDetails(issuanceId);
        const usageData = await this.getActualUsageData(issuance.daily_blast_id);

        return issuance.ExplosiveIssuanceItems.map(item => {
            const actualUsed = usageData[item.explosive_type_id] || 0;
            const totalReturned = parseFloat(item.quantity_returned || 0);
            const totalDamaged = parseFloat(item.quantity_damaged || 0);
            const totalWasted = parseFloat(item.quantity_wasted || 0);
            const totalAccounted = actualUsed + totalReturned + totalDamaged + totalWasted;
            const unbalanced = parseFloat(item.quantity_issued) - totalAccounted;

            return {
                explosive_type_id: item.explosive_type_id,
                explosive_type_name: item.ExplosiveType.TypeName,
                quantity_issued: parseFloat(item.quantity_issued),
                quantity_used: actualUsed,
                quantity_returned: totalReturned,
                quantity_damaged: totalDamaged,
                quantity_wasted: totalWasted,
                unbalanced_quantity: unbalanced,
                is_balanced: Math.abs(unbalanced) <= 0.01
            };
        });
    }

    // ... (other existing methods remain the same) ...

    validateReturnData(issuedQuantity, usedQuantity, returnData) {
        const totalReturned = parseFloat(returnData.quantity_returned || 0);
        const totalDamaged = parseFloat(returnData.quantity_damaged || 0);
        const totalWasted = parseFloat(returnData.quantity_wasted || 0);
        
        const totalAccounted = usedQuantity + totalReturned + totalDamaged + totalWasted;
        
        if (Math.abs(totalAccounted - issuedQuantity) > 0.01) {
            return {
                isValid: false,
                unbalancedQuantity: issuedQuantity - totalAccounted,
                message: `Total quantities don't match. Difference: ${issuedQuantity - totalAccounted}`
            };
        }

        return { isValid: true };
    }

    async checkStockAvailability(explosiveTypeId, requestedQuantity) {
        const stock = await ExplosiveStore.findOne({
            where: {
                ExplosiveTypeID: explosiveTypeId,
                CurrentStock: {
                    [Op.gte]: requestedQuantity
                }
            }
        });

        return !!stock;
    }

    async getNextSequenceNumber(dateStr) {
        const lastIssuance = await ExplosiveIssuance.findOne({
            where: {
                issuance_id: {
                    [Op.like]: `ISU-${dateStr}-%`
                }
            },
            order: [['issuance_id', 'DESC']]
        });

        if (!lastIssuance) return 1;

        const lastSequence = parseInt(lastIssuance.issuance_id.split('-')[2]);
        return lastSequence + 1;
    }

    async getIssuanceDetails(issuanceId) {
        const issuance = await ExplosiveIssuance.findOne({
            where: { issuance_id: issuanceId },
            include: [
                {
                    model: ExplosiveIssuanceItem,
                    include: [{
                        model: ExplosiveType,
                        attributes: ['TypeName', 'UnitOfMeasurement']
                    }]
                },
                {
                    model: DailyBlastOperation,
                    as: 'dailyOperation',
                    attributes: ['operation_date', 'status']
                }
            ]
        });

        if (!issuance) {
            throw new Error('Explosive issuance not found');
        }

        return issuance;
    }

    async getDailyIssuances(dailyBlastId) {
        return await ExplosiveIssuance.findAll({
            where: { daily_blast_id: dailyBlastId },
            include: [{
                model: ExplosiveIssuanceItem,
                include: [{
                    model: ExplosiveType,
                    attributes: ['TypeName', 'UnitOfMeasurement']
                }]
            }],
            order: [['issuance_date', 'DESC']]
        });
    }

    async updateIssuanceStatus(issuanceId, newStatus, userId) {
        const transaction = await sequelize.transaction();
        try {
            const issuance = await ExplosiveIssuance.findOne({
                where: { issuance_id: issuanceId }
            });

            if (!issuance) {
                throw new Error('Explosive issuance not found');
            }

            // Validate status transition
            if (!this.isValidStatusTransition(issuance.status, newStatus)) {
                throw new Error(`Invalid status transition from ${issuance.status} to ${newStatus}`);
            }

            await issuance.update({
                status: newStatus,
                updated_by: userId,
                completion_date: newStatus === 'COMPLETED' ? new Date() : null
            }, { transaction });

            await transaction.commit();
            return issuance;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'ISSUED': ['IN_USE', 'PENDING_RETURN'],
            'IN_USE': ['PENDING_RETURN'],
            'PENDING_RETURN': ['PARTIALLY_RETURNED', 'COMPLETED'],
            'PARTIALLY_RETURNED': ['COMPLETED']
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }

  

    calculateReconciliationStatus(issuedQuantity, accountedQuantity) {
        if (accountedQuantity === 0) return 'PENDING';
        if (accountedQuantity === issuedQuantity) return 'BALANCED';
        if (accountedQuantity < issuedQuantity) return 'UNBALANCED';
        throw new Error('Invalid quantities');
    }

    async updateIssuanceStatusBasedOnReturns(issuanceId, transaction) {
        const items = await ExplosiveIssuanceItem.findAll({
            where: { issuance_id: issuanceId }
        });

        const allBalanced = items.every(item => item.reconciliation_status === 'BALANCED');
        const anyUnbalanced = items.some(item => item.reconciliation_status === 'UNBALANCED');

        let newStatus;
        if (allBalanced) {
            newStatus = 'COMPLETED';
        } else if (anyUnbalanced) {
            newStatus = 'PARTIALLY_RETURNED';
        } else {
            newStatus = 'PENDING_RETURN';
        }

        await ExplosiveIssuance.update(
            { status: newStatus },
            { 
                where: { issuance_id: issuanceId },
                transaction 
            }
        );
    }

    async getReconciliation(issuanceId) {
        const issuance = await this.getIssuanceDetails(issuanceId);
        
        // Calculate totals and discrepancies
        const reconciliation = {
            issuanceDetails: {
                issuanceId: issuance.issuance_id,
                date: issuance.issuance_date,
                status: issuance.status
            },
            items: issuance.ExplosiveIssuanceItems.map(item => ({
                explosiveType: item.ExplosiveType.TypeName,
                issuedQuantity: parseFloat(item.quantity_issued),
                usedQuantity: parseFloat(item.quantity_used || 0),
                returnedQuantity: parseFloat(item.quantity_returned || 0),
                damagedQuantity: parseFloat(item.quantity_damaged || 0),
                wastedQuantity: parseFloat(item.quantity_wasted || 0),
                unaccountedQuantity: this.calculateUnaccounted(item),
                reconciliationStatus: item.reconciliation_status,
                reasons: {
                    damage: item.damage_reason,
                    waste: item.waste_reason
                }
            })),
            summary: {
                totalIssued: 0,
                totalUsed: 0,
                totalReturned: 0,
                totalDamaged: 0,
                totalWasted: 0,
                totalUnaccounted: 0
            }
        };

        // Calculate summary totals
        reconciliation.summary = reconciliation.items.reduce((sum, item) => ({
            totalIssued: sum.totalIssued + item.issuedQuantity,
            totalUsed: sum.totalUsed + item.usedQuantity,
            totalReturned: sum.totalReturned + item.returnedQuantity,
            totalDamaged: sum.totalDamaged + item.damagedQuantity,
            totalWasted: sum.totalWasted + item.wastedQuantity,
            totalUnaccounted: sum.totalUnaccounted + item.unaccountedQuantity
        }), {
            totalIssued: 0,
            totalUsed: 0,
            totalReturned: 0,
            totalDamaged: 0,
            totalWasted: 0,
            totalUnaccounted: 0
        });

        return reconciliation;
    }

    calculateUnaccounted(item) {
        return parseFloat(item.quantity_issued) -
            (parseFloat(item.quantity_used || 0) +
             parseFloat(item.quantity_returned || 0) +
             parseFloat(item.quantity_damaged || 0) +
             parseFloat(item.quantity_wasted || 0));
    }

    async getAvailableExplosives(storeId) {
        return await ExplosiveStore.findAll({
            where: {
                StoreID: storeId,
                CurrentStock: {
                    [Op.gt]: 0
                }
            },
            include: [{
                model: ExplosiveType,
                attributes: ['TypeName', 'UnitOfMeasure']
            }],
            attributes: [
                'ExplosiveTypeID',
                'CurrentStock',
                'BatchNumber',
                'ExpiryDate'
            ]
        });
    }

    async getIssuanceUsageStatus(issuanceId) {
        const issuance = await ExplosiveIssuance.findOne({
            where: { issuance_id: issuanceId },
            include: [
                {
                    model: ExplosiveIssuanceItem,
                    include: [{ model: ExplosiveType }]
                }
            ]
        });
     
        if (!issuance) {
            throw new Error('Issuance not found');
        }
     
        // Get all issuances for this daily blast operation
        const allIssuances = await ExplosiveIssuance.findAll({
            where: { daily_blast_id: issuance.daily_blast_id },
            include: [{
                model: ExplosiveIssuanceItem,
                include: [{ model: ExplosiveType }]
            }],
            order: [['created_at', 'ASC']]
        });
     
        // Get total usage per explosive type
        const totalUsage = await BlastHoleExplosive.findAll({
            attributes: [
                'explosive_type_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
            ],
            include: [{
                model: BlastHole,
                as: 'blastHole',
                attributes: [],
                required: true,
                include: [{
                    model: BlastEvent,
                    as: 'blastEvent',
                    attributes: [],
                    where: { daily_blast_id: issuance.daily_blast_id }
                }]
            }],
            group: ['explosive_type_id'],
            raw: true
        });
     
        const usageByType = new Map(
            totalUsage.map(u => [u.explosive_type_id, parseFloat(u.total)])
        );
     
        // Calculate usage per issuance using FIFO
        const usageDetails = await Promise.all(
            issuance.ExplosiveIssuanceItems.map(async (item) => {
                const totalUsedForType = usageByType.get(item.explosive_type_id) || 0;
                let currentUsage = 0;
     
                // Calculate usage for this specific issuance item
                let remainingUsage = totalUsedForType;
                for (const currIssuance of allIssuances) {
                    const matchingItem = currIssuance.ExplosiveIssuanceItems.find(
                        i => i.explosive_type_id === item.explosive_type_id
                    );
                    
                    if (matchingItem) {
                        const available = parseFloat(matchingItem.quantity_issued);
                        const used = Math.min(remainingUsage, available);
                        
                        if (matchingItem.issuance_item_id === item.issuance_item_id) {
                            currentUsage = used;
                            break;
                        }
                        
                        remainingUsage -= used;
                        if (remainingUsage <= 0) break;
                    }
                }
     
                return {
                    explosive_type_id: item.explosive_type_id,
                    explosive_name: item.ExplosiveType.TypeName,
                    unit: item.ExplosiveType.UnitOfMeasurement,
                    quantity_issued: parseFloat(item.quantity_issued),
                    quantity_used: currentUsage,
                    quantity_returned: parseFloat(item.quantity_returned || 0),
                    quantity_damaged: parseFloat(item.quantity_damaged || 0),
                    quantity_wasted: parseFloat(item.quantity_wasted || 0),
                    available_for_return: parseFloat(item.quantity_issued) - currentUsage,
                    reconciliation_status: this.calculateReconciliationStatus(
                        item.quantity_issued,
                        currentUsage,
                        item.quantity_returned,
                        item.quantity_damaged,
                        item.quantity_wasted
                    ),
                    last_update: item.updatedAt
                };
            })
        );
     
        return {
            issuance_id: issuanceId,
            daily_blast_id: issuance.daily_blast_id,
            status: issuance.status,
            details: usageDetails,
            summary: this.calculateUsageSummary(usageDetails)
        };
     }
    
     async calculateActualUsage(dailyBlastId, explosiveTypeId) {
        // Get total usage from all blast events for this explosive type
        const totalUsage = await BlastHoleExplosive.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('quantity')), 'total']
            ],
            include: [{
                model: BlastHole,
                as: 'blastHole',
                attributes: [],
                required: true,
                include: [{
                    model: BlastEvent,
                    as: 'blastEvent',
                    attributes: [],
                    where: { daily_blast_id: dailyBlastId }
                }]
            }],
            where: { explosive_type_id: explosiveTypeId },
            raw: true
        });
     
        const totalUsedQuantity = parseFloat(totalUsage?.total || 0);
     
        // Get all issuances for this explosive type in FIFO order
        const issuances = await ExplosiveIssuanceItem.findAll({
            include: [{
                model: ExplosiveIssuance,
                where: { daily_blast_id: dailyBlastId }
            }],
            where: { explosive_type_id: explosiveTypeId },
            order: [['created_at', 'ASC']]
        });
     
        // Calculate usage per issuance using FIFO
        let remainingUsage = totalUsedQuantity;
        const usageMap = new Map();
     
        for (const issuance of issuances) {
            const available = parseFloat(issuance.quantity_issued);
            const used = Math.min(remainingUsage, available);
            usageMap.set(issuance.issuance_item_id, used);
            remainingUsage -= used;
            if (remainingUsage <= 0) break;
        }
     
        return usageMap.get(issuanceId) || 0;
     }
    
    calculateReconciliationStatus(issued, used, returned, damaged, wasted) {
        const totalAccounted = used + returned + damaged + wasted;
        const difference = Math.abs(issued - totalAccounted);
        
        if (difference <= 0.01) return 'BALANCED';
        if (totalAccounted === 0) return 'PENDING';
        return 'UNBALANCED';
    }
    
    calculateUsageSummary(details) {
        return {
            total_issued: details.reduce((sum, item) => sum + item.quantity_issued, 0),
            total_used: details.reduce((sum, item) => sum + item.quantity_used, 0),
            total_returned: details.reduce((sum, item) => sum + item.quantity_returned, 0),
            total_damaged: details.reduce((sum, item) => sum + item.quantity_damaged, 0),
            total_wasted: details.reduce((sum, item) => sum + item.quantity_wasted, 0),
            reconciliation_complete: details.every(item => 
                item.reconciliation_status === 'BALANCED'
            )
        };
    }


    async generateReturnPreview(issuanceId) {
        const usageStatus = await this.getIssuanceUsageStatus(issuanceId);
        
        return {
            issuance_id: issuanceId,
            daily_blast_id: usageStatus.daily_blast_id,
            items: usageStatus.details.map(item => ({
                explosive_type_id: item.explosive_type_id,
                explosive_name: item.explosive_name,
                unit: item.unit,
                quantity_issued: item.quantity_issued,
                quantity_used: item.quantity_used,
                quantity_available: Math.max(0, item.available_for_return),
                max_returnable: item.available_for_return,
                issuance_item_id: item.issuance_item_id,
                batch_number: item.batch_number,
                status: item.reconciliation_status
            })),
            summary: {
                total_issued: usageStatus.summary.total_issued,
                total_used: usageStatus.summary.total_used,
                total_available: usageStatus.details.reduce((sum, item) => 
                    sum + Math.max(0, item.available_for_return), 0),
                can_complete: !usageStatus.details.some(item => 
                    item.available_for_return < 0 || 
                    item.reconciliation_status === 'UNBALANCED'
                )
            }
        };
     }










}

module.exports = new ExplosiveIssuanceService();