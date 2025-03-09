const { 
    Purchase, 
    PurchaseItems, 
    PurchaseHistory, 
    PurchaseDocument,
    WeeklyQuota,
    ExplosiveDealer,
    ExplosiveStore,
    StoreInventory,
    ExplosiveType,
    QuotaItems
} = require('../models');
const { generatePurchaseId, generateItemId, generateHistoryId, generateDocumentId, generatePurchaseItemIds, generatePurchaseHistoryId  , generateBulkPurchaseHistoryIds} = require('./id-generator.service');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');
const notificationService = require('../notifications/services/notification.service');
const storeInventoryService =require('./store-inventory.service');
const explosivePermitService = require('./explosive-permit.service')

// Purchase status constants
const PURCHASE_STATUS = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected'
};

class PurchaseService {
    /**
     * Create new purchase order by Site Engineer
     * Required: quotaId, dealerId, storeId, items(explosiveTypeId, quantity), paymentMethod
     * Optional: notes
     */
    async createPurchase(data, userId) {
        const transaction = await sequelize.transaction();

        try {
            // Validate quota
            const quota = await WeeklyQuota.findOne({
                where: {
                    QuotaID: data.quotaId,
                    Status: 'Approved'
                },
                include: [{
                    model: QuotaItems,
                    where: { PurchaseStatus: 'Available' },
                    include: [{ model: ExplosiveType }]
                }]
            });

            if (!quota) {
                throw { status: 400, message: 'Invalid or already used quota' };
            }

            // Validate quantities against quota
            this.validatePurchaseQuantities(data.items, quota.QuotaItems);

            // Generate IDs
            const purchaseId = await generatePurchaseId();

            // Create purchase with temporary total amount (will be updated by dealer)
            const purchase = await Purchase.create({
                PurchaseID: purchaseId,
                QuotaID: data.quotaId,
                DealerID: data.dealerId,
                StoreID: data.storeId,
                PurchaseDate: new Date(),
                Status: PURCHASE_STATUS.PENDING,
                TotalAmount: 0, // Will be updated when dealer confirms prices
                PaymentMethod: data.paymentMethod,
                Notes: data.notes,
                CreatedBy: userId
            }, { transaction });

            // Create purchase items with temporary values for dealer fields
            const itemIds = await generatePurchaseItemIds(data.items.length);
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];

                const quotaItem = quota.QuotaItems.find(qi => qi.ExplosiveTypeID === item.explosiveTypeId);
                    if (!quotaItem) throw { status: 400, message: 'Invalid explosive type' };
                    if (item.quantity > quotaItem.CalculatedQuantity) {
                        throw { status: 400, message: `Quantity exceeds quota limit` };
                    }

                    await quotaItem.update({ PurchaseStatus: 'Used' }, { transaction });

                await PurchaseItems.create({
                    PurchaseItemID: itemIds[i],
                    PurchaseID: purchaseId,
                    ExplosiveTypeID: item.explosiveTypeId,
                    Quantity: item.quantity,
                    UnitPrice: 0, // Temporary, will be set by dealer
                    TotalPrice: 0, // Temporary, will be set by dealer
                    BatchNumber: 'PENDING', // Temporary, will be set by dealer
                    ManufactureDate: null, // Will be set by dealer
                    ExpiryDate: null // Will be set by dealer
                }, { transaction });
            }

            // Mark quota as used
       await quota.update({ Status: 'Used' }, { transaction });

            // Create history record
            const historyId = await generatePurchaseHistoryId();
            await PurchaseHistory.create({
                HistoryID: historyId,
                PurchaseID: purchaseId,
                ChangeType: 'Created',
                NewStatus: PURCHASE_STATUS.PENDING,
                ChangedBy: userId,
                Remarks: 'Purchase order created by Site Engineer'
            }, { transaction });

            await transaction.commit();


            // Get purchase details with relationships for notification
        const purchaseDetails = await Purchase.findOne({
            where: { PurchaseID: purchase.PurchaseID },
            include: [
                { 
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: ExplosiveStore },
                { model: ExplosiveDealer }
            ]
        });

        // Send notification after successful commit
        await notificationService.sendPurchaseStatusNotification(
            purchase.PurchaseID,
            'Created',
            {
                purchaseId: purchase.PurchaseID,
                storeName: purchaseDetails.ExplosiveStore.StoreName,
                dealerName: purchaseDetails.ExplosiveDealer.Name,
                status: 'Created',
                items: purchaseDetails.PurchaseItems.map(item => ({
                    explosiveType: item.ExplosiveType.TypeName,
                    quantity: item.Quantity,
                })),
                paymentMethod: data.paymentMethod,
                notes: data.notes
            },
            userId
        );

            // TODO: Notification - New purchase order created
            // Notify dealer about new order

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Dealer confirms purchase with prices and batch details
     * Required: purchaseId, items(explosiveTypeId, unitPrice, batchNumber, manufactureDate, expiryDate)
     
    async confirmPurchase(purchaseId, itemDetails, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findOne({
                where: { 
                    PurchaseID: purchaseId,
                    Status: PURCHASE_STATUS.PENDING
                },
                include: [{ model: PurchaseItems }]
            });

            if (!purchase) {
                throw { status: 404, message: 'Purchase not found or not in pending status' };
            }

            let totalAmount = 0;

            // Update each item with dealer provided details
            for (const detail of itemDetails) {
                const purchaseItem = purchase.PurchaseItems.find(
                    item => item.ExplosiveTypeID === detail.explosiveTypeID
                );

                if (!purchaseItem) {
                    throw { status: 400, message: 'Invalid item details provided' };
                }

                const totalPrice = purchaseItem.Quantity * detail.unitPrice;
                totalAmount += totalPrice;

                await purchaseItem.update({
                    UnitPrice: detail.unitPrice,
                    TotalPrice: totalPrice,
                    BatchNumber: detail.batchNumber,
                    ManufactureDate: detail.manufactureDate,
                    ExpiryDate: detail.expiryDate
                }, { transaction });
            }

            // Update purchase with total amount and status
            await purchase.update({
                Status: PURCHASE_STATUS.CONFIRMED,
                TotalAmount: totalAmount,
                DealerConfirmationDate: new Date()
            }, { transaction });

            // Create history record
            await PurchaseHistory.create({
                HistoryID: await generateHistoryId(),
                PurchaseID: purchaseId,
                ChangeType: 'Confirmed',
                PreviousStatus: PURCHASE_STATUS.PENDING,
                NewStatus: PURCHASE_STATUS.CONFIRMED,
                ChangedBy: userId,
                Remarks: 'Purchase confirmed by dealer with prices and batch details'
            }, { transaction });

            await transaction.commit();

            await notificationService.sendPurchaseConfirmedNotification(
                purchaseId,
                {
                    orderDate: purchase.PurchaseDate,
                    confirmationDate: new Date(),
                    storeName: purchase.ExplosiveStore.StoreName,
                    dealerName: purchase.ExplosiveDealer.Name,
                    items: purchaseItems.map(item => ({
                        explosiveType: item.ExplosiveType.TypeName,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice,
                        totalPrice: item.TotalPrice,
                        batchNumber: item.BatchNumber
                    })),
                    totalAmount: totalAmount,
                    paymentMethod: purchase.PaymentMethod
                },
                userId
            );

            // TODO: Notification - Purchase confirmed by dealer
            // Notify site engineer about confirmation

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update delivery status
     * Required: purchaseId, items(explosiveTypeId, receivedQuantity)
     
    async updateDeliveryStatus(purchaseId, deliveryDetails, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findOne({
                where: { 
                    PurchaseID: purchaseId,
                    Status: PURCHASE_STATUS.CONFIRMED
                },
                include: [{ model: PurchaseItems }]
            });

            if (!purchase) {
                throw { status: 404, message: 'Purchase not found or not in confirmed status' };
            }

            // Update received quantities and inventory
            for (const detail of deliveryDetails.items) {
                const purchaseItem = purchase.PurchaseItems.find(
                    item => item.ExplosiveTypeID === detail.explosiveTypeId
                );

                if (!purchaseItem) {
                    throw { status: 400, message: 'Invalid item details provided' };
                }

                if (detail.receivedQuantity > purchaseItem.Quantity) {
                    throw { status: 400, message: 'Received quantity exceeds ordered quantity' };
                }

                await purchaseItem.update({
                    ReceivedQuantity: detail.receivedQuantity
                }, { transaction });

                // Update store inventory
                await this.updateStoreInventory(
                    purchase.StoreID,
                    detail.explosiveTypeId,
                    detail.receivedQuantity,
                    transaction
                );
            }

            // Update purchase status
            await purchase.update({
                Status: PURCHASE_STATUS.DELIVERED,
                DeliveryDate: new Date()
            }, { transaction });

            // Create history record
            await PurchaseHistory.create({
                HistoryID: await generateHistoryId(),
                PurchaseID: purchaseId,
                ChangeType: 'Delivered',
                PreviousStatus: PURCHASE_STATUS.CONFIRMED,
                NewStatus: PURCHASE_STATUS.DELIVERED,
                ChangedBy: userId,
                Remarks: 'Delivery completed and inventory updated'
            }, { transaction });

            await transaction.commit();

            

            // TODO: Notification - Delivery completed
            // Notify both dealer and site engineer
            // In updateDeliveryStatus method, after transaction commit


            await notificationService.sendPurchaseDeliveredNotification(
                purchaseId,
                {
                    orderDate: purchase.PurchaseDate,
                    deliveryDate: new Date(),
                    storeName: purchase.ExplosiveStore.StoreName,
                    dealerName: purchase.ExplosiveDealer.Name,
                    items: purchase.PurchaseItems.map(item => ({
                        explosiveType: item.ExplosiveType.TypeName,
                        quantity: item.Quantity,
                        receivedQuantity: item.ReceivedQuantity,
                        batchNumber: item.BatchNumber
                    })),
                    totalAmount: purchase.TotalAmount
                },
                    userId
            );

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update payment status
     
    async updatePaymentStatus(purchaseId, paymentStatus, data, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findByPk(purchaseId);
            if (!purchase) {
                throw { status: 404, message: 'Purchase not found' };
            }

            await purchase.update({
                PaymentStatus: paymentStatus,
                PaymentReference: data.paymentReference
            }, { transaction });

            // Create history record
            await PurchaseHistory.create({
                HistoryID: await generateHistoryId(),
                PurchaseID: purchaseId,
                ChangeType: 'Updated',
                Changes: { paymentStatus, reference: data.paymentReference },
                ChangedBy: userId,
                Remarks: `Payment status updated to ${paymentStatus}`
            }, { transaction });

            if (data.paymentProofURL) {
                await PurchaseDocument.create({
                    DocumentID: await generateDocumentId(),
                    PurchaseID: purchaseId,
                    DocumentType: 'PaymentProof',
                    DocumentURL: data.paymentProofURL,
                    UploadedBy: userId,
                    Description: 'Payment proof document'
                }, { transaction });
            }

            await transaction.commit();

            // TODO: Notification - Payment status updated
            // Notify relevant parties about payment update



            await notificationService.sendPaymentStatusNotification(
                purchaseId,
                {
                    paymentStatus: paymentStatus,
                    paymentDate: new Date(),
                    paymentReference: data.paymentReference,
                    amount: purchase.TotalAmount,
                    paymentMethod: purchase.PaymentMethod
                },
                userId
            );

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Dealer confirms purchase with prices and batch details
     */
    /*async confirmPurchase(purchaseId, itemDetails, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findOne({
                where: { 
                    PurchaseID: purchaseId,
                    Status: PURCHASE_STATUS.PENDING
                },
                include: [
                    { 
                        model: PurchaseItems,
                        include: [{ model: ExplosiveType }]
                    },
                    { 
                        model: WeeklyQuota,
                        
                        include: [QuotaItems]
                    },
                    { model: ExplosiveStore },
                    { model: ExplosiveDealer }
                ],
                transaction
            });

            console.log(purchase.ExplosiveStore);

            if (!purchase) {
                throw { status: 404, message: 'Purchase not found or not in pending status' };
            }

            let totalAmount = 0;

            // Update each item with dealer provided details
            for (const detail of itemDetails) {
                const purchaseItem = purchase.PurchaseItems.find(
                    item => item.ExplosiveTypeID === detail.explosiveTypeID
                );

                if (!purchaseItem) {
                    throw { status: 400, message: 'Invalid item details provided' };
                }

                const totalPrice = purchaseItem.Quantity * detail.unitPrice;
                totalAmount += totalPrice;

                await purchaseItem.update({
                    UnitPrice: detail.unitPrice,
                    TotalPrice: totalPrice,
                    BatchNumber: detail.batchNumber,
                    ManufactureDate: detail.manufactureDate,
                    ExpiryDate: detail.expiryDate
                }, { transaction });
            }

            // Update purchase status
            await purchase.update({
                Status: PURCHASE_STATUS.CONFIRMED,
                TotalAmount: totalAmount,
                DealerConfirmationDate: new Date()
            }, { transaction });

            // Create history record
            await PurchaseHistory.create({
                HistoryID: await generateHistoryId(),
                PurchaseID: purchaseId,
                ChangeType: 'Confirmed',
                PreviousStatus: PURCHASE_STATUS.PENDING,
                NewStatus: PURCHASE_STATUS.CONFIRMED,
                ChangedBy: userId,
                Remarks: 'Purchase confirmed by dealer with prices and batch details'
            }, { transaction });

            console.log(purchase.WeeklyQuota.PermitID);
            console.log(purchase.WeeklyQuota.QuotaItems);

            
        


            // Update permit remaining quantities using quota amounts
        await explosivePermitService.updateRemainingQuantities(
            purchase.WeeklyQuota.PermitID, 
            purchase.WeeklyQuota.QuotaItems,
            userId
        );

            await transaction.commit();

            try {
                await notificationService.sendPurchaseConfirmedNotification(
                    purchaseId,
                    {
                        orderDate: purchase.PurchaseDate,
                        confirmationDate: new Date(),
                        storeName: purchase.ExplosiveStore.StoreName,
                        dealerName: purchase.ExplosiveDealer.Name,
                        items: purchase.PurchaseItems.map(item => ({
                            explosiveType: item.ExplosiveType.TypeName,
                            quantity: item.Quantity,
                            unitPrice: item.UnitPrice,
                            totalPrice: item.TotalPrice,
                            batchNumber: item.BatchNumber
                        })),
                        totalAmount: totalAmount,
                        paymentMethod: purchase.PaymentMethod
                    },
                    userId
                );
            } catch (notificationError) {
                console.error('Failed to send confirmation notification:', notificationError);
            }

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }*/

        async confirmPurchase(purchaseId, itemDetails, userId) {
            // First verify and load WeeklyQuota data before transaction
            const verifyPurchase = await Purchase.findOne({
                where: { 
                    PurchaseID: purchaseId,
                    Status: PURCHASE_STATUS.PENDING
                },
                include: [
                    { 
                        model: WeeklyQuota,
                        as: 'WeeklyQuotum',
                        include: [{
                            model: QuotaItems,
                            include: [{ model: ExplosiveType }]
                        }]
                    }
                ]
            });
        
            if (!verifyPurchase || !verifyPurchase.WeeklyQuotum) {
                throw { status: 404, message: 'Purchase or quota data not found' };
            }
        
            // Store quota data
            const quotaData = {
                quotaId: verifyPurchase.WeeklyQuotum.QuotaID,
                permitId: verifyPurchase.WeeklyQuotum.PermitID,
                quotaItems: verifyPurchase.WeeklyQuotum.QuotaItems
            };
        
            const transaction = await sequelize.transaction();
        
            try {
                // Load purchase with all needed relationships
                const purchase = await Purchase.findOne({
                    where: { 
                        PurchaseID: purchaseId,
                        Status: PURCHASE_STATUS.PENDING
                    },
                    include: [
                        { 
                            model: PurchaseItems,
                            include: [{ model: ExplosiveType }]
                        },
                        { model: ExplosiveStore },
                        { model: ExplosiveDealer }
                    ],
                    transaction
                });
        
                if (!purchase) {
                    throw { status: 404, message: 'Purchase not found or not in pending status' };
                }
        
                // Validate purchase items against quota
                for (const item of purchase.PurchaseItems) {
                    const quotaItem = quotaData.quotaItems.find(
                        qi => qi.ExplosiveTypeID === item.ExplosiveTypeID
                    );
                    
                    if (!quotaItem) {
                        throw { status: 400, message: `No quota found for explosive type: ${item.ExplosiveType.TypeName}` };
                    }


                    // when creating purchase order status changed to used thats the case
                    /*if (quotaItem.PurchaseStatus === 'Used') {
                        throw { status: 400, message: `Quota already used for: ${item.ExplosiveType.TypeName}` };
                    }*/
        
                    if (item.Quantity > quotaItem.CalculatedQuantity) {
                        throw { status: 400, message: `Purchase quantity exceeds quota for: ${item.ExplosiveType.TypeName}` };
                    }
                }
        
                let totalAmount = 0;
                const historyIds = await generateBulkPurchaseHistoryIds(itemDetails.length);
                let historyIdIndex = 0;
        
                // Update purchase items with dealer details
                for (const detail of itemDetails) {
                    const purchaseItem = purchase.PurchaseItems.find(
                        item => item.ExplosiveTypeID === detail.explosiveTypeID
                    );
        
                    if (!purchaseItem) {
                        throw { status: 400, message: 'Invalid item details provided' };
                    }
        
                    const totalPrice = purchaseItem.Quantity * detail.unitPrice;
                    totalAmount += totalPrice;
        
                    await purchaseItem.update({
                        UnitPrice: detail.unitPrice,
                        TotalPrice: totalPrice,
                        BatchNumber: detail.batchNumber,
                        ManufactureDate: detail.manufactureDate,
                        ExpiryDate: detail.expiryDate
                    }, { transaction });
                }
        
                // Update purchase status
                await purchase.update({
                    Status: PURCHASE_STATUS.CONFIRMED,
                    TotalAmount: totalAmount,
                    DealerConfirmationDate: new Date()
                }, { transaction });
        
                // Create history record
                await PurchaseHistory.create({
                    HistoryID: historyIds[historyIdIndex++],
                    PurchaseID: purchaseId,
                    ChangeType: 'Confirmed',
                    PreviousStatus: PURCHASE_STATUS.PENDING,
                    NewStatus: PURCHASE_STATUS.CONFIRMED,
                    ChangedBy: userId,
                    Remarks: 'Purchase confirmed by dealer with prices and batch details'
                }, { transaction });

                // Update permit remaining quantities
                await explosivePermitService.updateRemainingQuantities(
                    quotaData.permitId,
                    quotaData.quotaItems,
                    userId,
                    
                );
        
                
        
                // Update quota items status
                for (const quotaItem of quotaData.quotaItems) {
                    await QuotaItems.update(
                        { PurchaseStatus: 'Used' },
                        { 
                            where: { QuotaItemID: quotaItem.QuotaItemID },
                            transaction 
                        }
                    );
                }
        
                await transaction.commit();

                
        
                // Send notification after successful commit
                try {
                    await notificationService.sendPurchaseConfirmedNotification(
                        purchaseId,
                        {
                            orderDate: purchase.PurchaseDate,
                            confirmationDate: new Date(),
                            storeName: purchase.ExplosiveStore.StoreName,
                            dealerName: purchase.ExplosiveDealer.Name,
                            items: purchase.PurchaseItems.map(item => ({
                                explosiveType: item.ExplosiveType.TypeName,
                                quantity: item.Quantity,
                                unitPrice: item.UnitPrice,
                                totalPrice: item.TotalPrice,
                                batchNumber: item.BatchNumber
                            })),
                            totalAmount: totalAmount,
                            paymentMethod: purchase.PaymentMethod
                        },
                        userId
                    );
                } catch (notificationError) {
                    console.error('Failed to send confirmation notification:', notificationError);
                }
        
                // Return fresh purchase details
                return await this.getPurchaseDetails(purchaseId);
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        }

    /**
     * Update delivery status
     */
    async updateDeliveryStatus(purchaseId, deliveryDetails, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findOne({
                where: { 
                    PurchaseID: purchaseId,
                    Status: PURCHASE_STATUS.CONFIRMED
                },
                include: [
                    { 
                        model: PurchaseItems,
                        include: [{ model: ExplosiveType }]
                    },
                    { model: ExplosiveStore },
                    { model: ExplosiveDealer }
                ]
            });

            if (!purchase) {
                throw { status: 404, message: 'Purchase not found or not in confirmed status' };
            }

            // Update received quantities and inventory
            for (const detail of deliveryDetails.items) {
                const purchaseItem = purchase.PurchaseItems.find(
                    item => item.ExplosiveTypeID === detail.explosiveTypeID
                );

                if (!purchaseItem) {
                    throw { status: 400, message: 'Invalid item details provided' };
                }

                if (detail.receivedQuantity > purchaseItem.Quantity) {
                    throw { status: 400, message: 'Received quantity exceeds ordered quantity' };
                }

                await purchaseItem.update({
                    ReceivedQuantity: detail.receivedQuantity
                }, { transaction });

                // Update store inventory
                /*await this.updateStoreInventory(
                    purchase.StoreID,
                    detail.explosiveTypeID,
                    detail.receivedQuantity,
                    transaction
                );*/


                // Get inventory ID
            const inventory = await StoreInventory.findOne({
                where: {
                    StoreID: purchase.StoreID,
                    ExplosiveTypeID: detail.explosiveTypeID
                }
            });

            // Update inventory using storeInventoryService
            await storeInventoryService.updateInventory(
                inventory.InventoryID,
                detail.receivedQuantity,
                'IN',
                {
                    type: 'Purchase',
                    id: purchaseId,
                    batchNumber: purchaseItem.BatchNumber,
                    remarks: `Purchase delivery - ${purchase.PurchaseID}`
                },
                userId,
                transaction
            );
        

            }

            // Update purchase status
            await purchase.update({
                Status: PURCHASE_STATUS.DELIVERED,
                DeliveryDate: new Date()
            }, { transaction });

            // Create history record
            await PurchaseHistory.create({
                HistoryID: await generatePurchaseHistoryId(),
                PurchaseID: purchaseId,
                ChangeType: 'Delivered',
                PreviousStatus: PURCHASE_STATUS.CONFIRMED,
                NewStatus: PURCHASE_STATUS.DELIVERED,
                ChangedBy: userId,
                Remarks: 'Delivery completed and inventory updated'
            }, { transaction });

            await transaction.commit();

            try {
                await notificationService.sendPurchaseDeliveredNotification(
                    purchaseId,
                    {
                        orderDate: purchase.PurchaseDate,
                        deliveryDate: new Date(),
                        storeName: purchase.ExplosiveStore.StoreName,
                        dealerName: purchase.ExplosiveDealer.Name,
                        items: purchase.PurchaseItems.map(item => ({
                            explosiveType: item.ExplosiveType.TypeName,
                            quantity: item.Quantity,
                            receivedQuantity: item.ReceivedQuantity,
                            batchNumber: item.BatchNumber
                        })),
                        totalAmount: purchase.TotalAmount
                    },
                    userId
                );
            } catch (notificationError) {
                console.error('Failed to send delivery notification:', notificationError);
            }

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update payment status
     */
    async updatePaymentStatus(purchaseId, paymentStatus, data, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findOne({
                where: { PurchaseID: purchaseId },
                include: [
                    { 
                        model: PurchaseItems,
                        include: [{ model: ExplosiveType }]
                    },
                    { model: ExplosiveStore },
                    { model: ExplosiveDealer }
                ]
            });

            if (!purchase) {
                throw { status: 404, message: 'Purchase not found' };
            }

            await purchase.update({
                PaymentStatus: paymentStatus,
                PaymentReference: data.paymentReference
            }, { transaction });

            // Create history record
            await PurchaseHistory.create({
                HistoryID: await generatePurchaseHistoryId(),
                PurchaseID: purchaseId,
                ChangeType: 'Updated',
                Changes: { paymentStatus, reference: data.paymentReference },
                ChangedBy: userId,
                Remarks: `Payment status updated to ${paymentStatus}`
            }, { transaction });

            if (data.paymentProofURL) {
                await PurchaseDocument.create({
                    DocumentID: await generateDocumentId(),
                    PurchaseID: purchaseId,
                    DocumentType: 'PaymentProof',
                    DocumentURL: data.paymentProofURL,
                    UploadedBy: userId,
                    Description: 'Payment proof document'
                }, { transaction });
            }

            await transaction.commit();

            try {
                await notificationService.sendPaymentStatusNotification(
                    purchaseId,
                    {
                        paymentStatus: paymentStatus,
                        paymentDate: new Date(),
                        paymentReference: data.paymentReference,
                        amount: purchase.TotalAmount,
                        paymentMethod: purchase.PaymentMethod,
                        storeName: purchase.ExplosiveStore.StoreName,
                        dealerName: purchase.ExplosiveDealer.Name
                    },
                    userId
                );
            } catch (notificationError) {
                console.error('Failed to send payment notification:', notificationError);
            }

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }









    /**
     * Get purchase details with all related information
     
    async getPurchaseDetails(purchaseId) {
        return await Purchase.findOne({
            where: { PurchaseID: purchaseId },
            include: [
                {
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: WeeklyQuota },
                { model: ExplosiveDealer },
                { model: ExplosiveStore },
                { model: PurchaseDocument },
                {
                    model: PurchaseHistory,
                    order: [['CreatedAt', 'DESC']]
                }
            ]
        });
    }

    /**
     * Get dealer purchases with filters
     
    async getDealerPurchases(dealerId, filters = {}) {
        const whereClause = { DealerID: dealerId };
        
        if (filters.status) {
            whereClause.Status = filters.status;
        }

        if (filters.startDate && filters.endDate) {
            whereClause.PurchaseDate = {
                [Op.between]: [filters.startDate, filters.endDate]
            };
        }

        return await Purchase.findAll({
            where: whereClause,
            include: [
                {
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: ExplosiveStore }
            ],
            order: [['PurchaseDate', 'DESC']]
        });
    }

    /**
     * Get store purchases with filters
     
    async getStorePurchases(storeId, filters = {}) {
        const whereClause = { StoreID: storeId };
        
        if (filters.status) {
            whereClause.Status = filters.status;
        }

        if (filters.startDate && filters.endDate) {
            whereClause.PurchaseDate = {
                [Op.between]: [filters.startDate, filters.endDate]
            };
        }

        return await Purchase.findAll({
            where: whereClause,
            include: [
                {
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: ExplosiveDealer }
            ],
            order: [['PurchaseDate', 'DESC']]
        });
    }

    // Private helper methods
    async updateStoreInventory(storeId, explosiveTypeId, quantity, transaction) {
        const inventory = await StoreInventory.findOne({
            where: {
                StoreID: storeId,
                ExplosiveTypeID: explosiveTypeId
            }
        });

        if (inventory) {
            await inventory.update({
                CurrentQuantity: sequelize.literal(`CurrentQuantity + ${quantity}`),
                LastUpdated: new Date()
            }, { transaction });
        } else {
            await StoreInventory.create({
                StoreID: storeId,
                ExplosiveTypeID: explosiveTypeId,
                CurrentQuantity: quantity,
                LastUpdated: new Date()
            }, { transaction });
        }
    }

    validatePurchaseQuantities(items, quotaItems) {
        for (const item of items) {
            const quotaItem = quotaItems.find(
                qi => qi.ExplosiveTypeID === item.explosiveTypeId
            );

            if (!quotaItem) {
                throw { 
                    status: 400, 
                    message: `Invalid explosive type: ${item.explosiveTypeId}` 
                };
            }

            if (item.quantity > quotaItem.ApprovedQuantity) {
                throw { 
                    status: 400, 
                    message: `Quantity exceeds approved quota for ${quotaItem.ExplosiveType.TypeName}` 
                };
            }
        }
    }*/

        // Helper methods remain the same, shall I continue with those as well?
    /**
     * Get purchase details
     */
    async getPurchaseDetails(purchaseId) {
        return await Purchase.findOne({
            where: { PurchaseID: purchaseId },
            include: [
                {
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: WeeklyQuota ,include: [QuotaItems]},
                { model: ExplosiveDealer },
                { model: ExplosiveStore },
                { model: PurchaseDocument },
                {
                    model: PurchaseHistory,
                    order: [['CreatedAt', 'DESC']]
                }
            ]
        });
    }

    /**
     * Get dealer purchases with filters
     */
    async getDealerPurchases(dealerId, filters = {}) {
        const whereClause = { DealerID: dealerId };
        
        if (filters.status) {
            whereClause.Status = filters.status;
        }

        if (filters.startDate && filters.endDate) {
            whereClause.PurchaseDate = {
                [Op.between]: [filters.startDate, filters.endDate]
            };
        }

        return await Purchase.findAll({
            where: whereClause,
            include: [
                {
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: ExplosiveStore }
            ],
            order: [['PurchaseDate', 'DESC']]
        });
    }

    /**
     * Get store purchases with filters
     */
    async getStorePurchases(storeId, filters = {}) {
        const whereClause = { StoreID: storeId };
        
        if (filters.status) {
            whereClause.Status = filters.status;
        }

        if (filters.startDate && filters.endDate) {
            whereClause.PurchaseDate = {
                [Op.between]: [filters.startDate, filters.endDate]
            };
        }

        return await Purchase.findAll({
            where: whereClause,
            include: [
                {
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                },
                { model: ExplosiveDealer }
            ],
            order: [['PurchaseDate', 'DESC']]
        });
    }

    /**
     * Update store inventory
     * @private
     */
    async updateStoreInventory(storeId, explosiveTypeId, quantity, transaction) {
        const inventory = await StoreInventory.findOne({
            where: {
                StoreID: storeId,
                ExplosiveTypeID: explosiveTypeId
            }
        });

        if (inventory) {
            await inventory.update({
                CurrentQuantity: sequelize.literal(`CurrentQuantity + ${quantity}`),
                LastUpdated: new Date()
            }, { transaction });
        } else {
            await StoreInventory.create({
                StoreID: storeId,
                ExplosiveTypeID: explosiveTypeId,
                CurrentQuantity: quantity,
                LastUpdated: new Date()
            }, { transaction });
        }
    }

    /**
     * Validate purchase quantities against quota
     * @private
     */
    /*validatePurchaseQuantities(items, quotaItems) {
        for (const item of items) {
            const quotaItem = quotaItems.find(
                qi => qi.ExplosiveTypeID === item.explosiveTypeId
            );

            if (!quotaItem) {
                throw { 
                    status: 400, 
                    message: `Invalid explosive type: ${item.explosiveTypeId}` 
                };
            }

            if (item.quantity > quotaItem.ApprovedQuantity) {
                throw { 
                    status: 400, 
                    message: `Quantity exceeds approved quota for ${quotaItem.ExplosiveType.TypeName}` 
                };
            }
        }
    }*/

        validatePurchaseQuantities(items, quotaItems) {
            for (const item of items) {

                const quotaItem = quotaItems.find(qi => qi.ExplosiveTypeID === item.explosiveTypeId);
                if (!quotaItem) {
                    throw { status: 400, message: `Invalid explosive type: ${item.explosiveTypeId}` };
                }
                if (quotaItem.PurchaseStatus === 'Used') {
                    throw { status: 400, message: 'Quota has already been used' };
                }
                if (Number(item.quantity) > Number(quotaItem.CalculatedQuantity)) {
                    throw { status: 400, message: `Purchase quantity exceeds quota limit for ${quotaItem.ExplosiveType.TypeName}` };
                }
            }
        }






} 



module.exports = new PurchaseService();