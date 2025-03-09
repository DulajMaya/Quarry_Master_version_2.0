// purchase.service.js

const { 
    Purchase, 
    PurchaseItems, 
    PurchaseHistory, 
    PurchaseDocument,
    WeeklyQuota,
    ExplosiveDealer,
    ExplosiveStore,
    StoreInventory,
    ExplosiveType
} = require('../models');
const { generatePurchaseId, generateItemId, generateHistoryId, generateDocumentId, generatePurchaseItemIds, generatePurchaseHistoryId } = require('./id-generator.service');
const { sendEmail } = require('../utils/email.util');
const { Op } = require('sequelize');
const notificationService = require('../notifications/services/notification.service');
const sequelize = require('../config/db.config'); 


class PurchaseService {
    /**
     * Create new purchase order
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
                    include: [{ model: ExplosiveType }]
                }]
            });

            if (!quota) {
                throw { status: 400, message: 'Invalid or unapproved quota' };
            }

            // Validate quantities against quota
            this.validatePurchaseQuantities(data.items, quota.QuotaItems);

            // Generate IDs
            const purchaseId = await generatePurchaseId();

            // Calculate total amount
            const totalAmount = data.items.reduce(
                (sum, item) => sum + (item.quantity * item.unitPrice), 
                0
            );

            // Create purchase
            const purchase = await Purchase.create({
                PurchaseID: purchaseId,
                QuotaID: data.quotaId,
                DealerID: data.dealerId,
                StoreID: data.storeId,
                PurchaseDate: new Date(),
                Status: 'Pending',
                TotalAmount: totalAmount,
                PaymentMethod: data.paymentMethod,
                Notes: data.notes,
                CreatedBy: userId
            }, { transaction });

            // Create purchase items
            const itemIds = await generatePurchaseItemIds(data.items.length);
            for (let i = 0; i < data.items.length; i++) {
                const item = data.items[i];
                await PurchaseItems.create({
                    PurchaseItemID: itemIds[i],
                    PurchaseID: purchaseId,
                    ExplosiveTypeID: item.explosiveTypeId,
                    Quantity: item.quantity,
                    UnitPrice: item.unitPrice,
                    TotalPrice: item.quantity * item.unitPrice,
                    BatchNumber: item.batchNumber,
                    ManufactureDate: item.manufactureDate,
                    ExpiryDate: item.expiryDate
                }, { transaction });
            }

            // Create history record
            const historyId = await generatePurchaseHistoryId();
            await PurchaseHistory.create({
                HistoryID: historyId,
                PurchaseID: purchaseId,
                ChangeType: 'Created',
                NewStatus: 'Pending',
                ChangedBy: userId,
                Remarks: 'Initial purchase order'
            }, { transaction });


            // Send notification to dealer
            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PURCHASE_STATUS,
                title: 'New Purchase Order',
                message: `New purchase order ${purchase.PurchaseID} created`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PURCHASE',
                referenceId: purchase.PurchaseID,
                recipients: await recipientService.getPurchaseRecipients(purchase.PurchaseID),
                emailTemplate: 'PURCHASE_ORDER',
                emailData: {
                    status: 'Created',
                    purchaseId: purchase.PurchaseID,
                    orderDate: purchase.PurchaseDate,
                    items: data.items.map(item => ({
                        explosiveType: item.explosiveType,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice
                    })),
                    totalAmount: data.totalAmount,
                    notes: data.notes
                }
            });

            await transaction.commit();

            // Notify dealer
            //await this.notifyDealer(purchase, 'new_order');

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Update purchase status
     */
    async updatePurchaseStatus(purchaseId, status, data, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findOne({
                where: { PurchaseID: purchaseId },
                include: [{ 
                    model: PurchaseItems,
                    include: [{ model: ExplosiveType }]
                }]
            });

            if (!purchase) {
                throw { status: 404, message: 'Purchase not found' };
            }

            const previousStatus = purchase.Status;

            if (status === 'Confirmed') {
                // Handle dealer confirmation
                await purchase.update({
                    Status: 'Confirmed',
                    DealerConfirmationDate: new Date(),
                    ReceiptNumber: data.receiptNumber
                }, { transaction });

                // Handle receipt upload if provided
                if (data.receiptPhotoURL) {
                    const documentId = await generateDocumentId();
                    await PurchaseDocument.create({
                        DocumentID: documentId,
                        PurchaseID: purchaseId,
                        DocumentType: 'Receipt',
                        DocumentURL: data.receiptPhotoURL,
                        UploadedBy: userId
                    }, { transaction });

                    await purchase.update({
                        ReceiptPhotoURL: data.receiptPhotoURL
                    }, { transaction });
                }
            } else if (status === 'Delivered') {
                // Validate received quantities
                for (const item of data.items) {
                    const purchaseItem = purchase.PurchaseItems.find(
                        pi => pi.ExplosiveTypeID === item.explosiveTypeId
                    );

                    if (!purchaseItem) {
                        throw { status: 400, message: 'Invalid explosive type' };
                    }

                    if (item.receivedQuantity > purchaseItem.Quantity) {
                        throw { 
                            status: 400, 
                            message: 'Received quantity exceeds ordered quantity' 
                        };
                    }

                    // Update received quantity
                    await purchaseItem.update({
                        ReceivedQuantity: item.receivedQuantity
                    }, { transaction });

                    // Update store inventory
                    await this.updateStoreInventory(
                        purchase.StoreID,
                        item.explosiveTypeId,
                        item.receivedQuantity,
                        transaction
                    );
                }

                await purchase.update({
                    Status: 'Delivered',
                    DeliveryDate: new Date()
                }, { transaction });
            } else if (status === 'Cancelled' || status === 'Rejected') {
                await purchase.update({
                    Status: status,
                    RejectionReason: data.reason
                }, { transaction });
            }

            // Create history record
            const historyId = await generatePurchaseHistoryId();
            await PurchaseHistory.create({
                HistoryID: historyId,
                PurchaseID: purchaseId,
                ChangeType: 'StatusChanged',
                PreviousStatus: previousStatus,
                NewStatus: status,
                ChangedBy: userId,
                Remarks: data.reason || `Purchase ${status.toLowerCase()}`
            }, { transaction });


            /*await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PURCHASE_STATUS,
                title: `Purchase Order ${status}`,
                message: `Purchase order ${purchase.PurchaseID} has been ${status.toLowerCase()}`,
                priority: ['Cancelled', 'Rejected'].includes(status) ? 
                    NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PURCHASE',
                referenceId: purchaseId,
                recipients: await this.getPurchaseRecipients(purchase, ['SITE_ENGINEER', 'EXPLOSIVE_DEALER']),
                emailTemplate: 'PURCHASE_ORDER',
                emailData: {
                    status,
                    purchaseId: purchase.PurchaseID,
                    orderDate: purchase.PurchaseDate,
                    items: purchase.PurchaseItems.map(item => ({
                        explosiveType: item.ExplosiveType.TypeName,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice,
                        totalPrice: item.TotalPrice
                    })),
                    reason: data.reason,
                    receiptNumber: data.receiptNumber,
                    deliveryDate: status === 'Delivered' ? data.deliveryDate : null
                }
            });*/

            // Send status notification
            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PURCHASE_STATUS,
                title: `Purchase Order ${status}`,
                message: `Purchase order ${purchaseId} has been ${status.toLowerCase()}`,
                priority: ['Cancelled', 'Rejected'].includes(status) ? 
                    NOTIFICATION_PRIORITY.HIGH : NOTIFICATION_PRIORITY.MEDIUM,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PURCHASE',
                referenceId: purchaseId,
                recipients: await recipientService.getPurchaseRecipients(purchaseId),
                emailTemplate: 'PURCHASE_ORDER',
                emailData: {
                    status,
                    purchaseId: purchase.PurchaseID,
                    items: purchase.PurchaseItems.map(item => ({
                        explosiveType: item.ExplosiveType.TypeName,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice,
                        totalPrice: item.TotalPrice,
                        receivedQuantity: status === 'Delivered' ? item.ReceivedQuantity : null
                    })),
                    reason: data.reason,
                    deliveryDate: status === 'Delivered' ? new Date() : null,
                    receiptNumber: data.receiptNumber
                }
            });

            await transaction.commit();

            // Send notifications
            //await this.notifyStatusChange(purchase, status);

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
            const purchase = await Purchase.findByPk(purchaseId);
            if (!purchase) {
                throw { status: 404, message: 'Purchase not found' };
            }

            await purchase.update({
                PaymentStatus: paymentStatus,
                PaymentReference: data.paymentReference
            }, { transaction });

            // Create history record
            const historyId = await generateHistoryId();
            await PurchaseHistory.create({
                HistoryID: historyId,
                PurchaseID: purchaseId,
                ChangeType: 'Updated',
                Changes: { paymentStatus, reference: data.paymentReference },
                ChangedBy: userId,
                Remarks: `Payment status updated to ${paymentStatus}`
            }, { transaction });

            if (data.paymentProofURL) {
                const documentId = await generateDocumentId();
                await PurchaseDocument.create({
                    DocumentID: documentId,
                    PurchaseID: purchaseId,
                    DocumentType: 'PaymentProof',
                    DocumentURL: data.paymentProofURL,
                    UploadedBy: userId,
                    Description: 'Payment proof document'
                }, { transaction });
            }

            /*await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PAYMENT_STATUS,
                title: `Payment ${paymentStatus}`,
                message: `Payment for order ${purchaseId} has been ${paymentStatus.toLowerCase()}`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PURCHASE',
                referenceId: purchaseId,
                recipients: await this.getPurchaseRecipients(purchase, ['SITE_ENGINEER', 'EXPLOSIVE_DEALER']),
                emailTemplate: 'PAYMENT_STATUS',
                emailData: {
                    status: paymentStatus,
                    purchaseId: purchase.PurchaseID,
                    paymentReference: data.paymentReference,
                    amount: purchase.TotalAmount,
                    paymentDate: new Date(),
                    attachments: data.paymentProofURL ? [{
                        filename: 'payment_proof.pdf',
                        path: data.paymentProofURL
                    }] : []
                }
            });*/

            await notificationService.createNotification({
                type: NOTIFICATION_TYPES.PAYMENT_STATUS,
                title: `Payment ${paymentStatus}`,
                message: `Payment for order ${purchaseId} has been ${paymentStatus.toLowerCase()}`,
                priority: NOTIFICATION_PRIORITY.HIGH,
                deliveryType: DELIVERY_TYPES.BOTH,
                referenceType: 'PURCHASE',
                referenceId: purchaseId,
                recipients: await recipientService.getPurchaseRecipients(purchaseId),
                emailTemplate: 'PAYMENT_STATUS',
                emailData: {
                    status: paymentStatus,
                    purchaseId: purchase.PurchaseID,
                    paymentDate: new Date(),
                    paymentReference: data.paymentReference,
                    amount: purchase.TotalAmount,
                    paymentMethod: purchase.PaymentMethod
                }
            });

            await transaction.commit();

            return await this.getPurchaseDetails(purchaseId);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Helper method to get recipients
    /*async getPurchaseRecipients(purchase, roles) {
        let recipients = [];
        
        if (roles.includes('SITE_ENGINEER')) {
            const engineers = await notificationService.getRecipientsByRole(
                ['SITE_ENGINEER'],
                purchase.StoreID
            );
            recipients.push(...engineers);
        }
        
        if (roles.includes('EXPLOSIVE_DEALER')) {
            const dealer = await ExplosiveDealer.findByPk(purchase.DealerID);
            recipients.push({
                id: dealer.id,
                email: dealer.Email,
                name: dealer.Name
            });
        }
        
        return recipients;
    }*/

    /**
     * Upload purchase document
     */
    async uploadDocument(purchaseId, documentData, userId) {
        const transaction = await sequelize.transaction();

        try {
            const purchase = await Purchase.findByPk(purchaseId);
            if (!purchase) {
                throw { status: 404, message: 'Purchase not found' };
            }

            const documentId = await generateDocumentId();
            const document = await PurchaseDocument.create({
                DocumentID: documentId,
                PurchaseID: purchaseId,
                DocumentType: documentData.type,
                DocumentURL: documentData.url,
                UploadedBy: userId,
                Description: documentData.description
            }, { transaction });

            // Create history record
            const historyId = await generateHistoryId();
            await PurchaseHistory.create({
                HistoryID: historyId,
                PurchaseID: purchaseId,
                ChangeType: 'Updated',
                Changes: { documentUploaded: documentData.type },
                ChangedBy: userId,
                Remarks: `Document uploaded: ${documentData.type}`
            }, { transaction });

            await transaction.commit();

            return document;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Get purchase details
     */
    async getPurchaseDetails(purchaseId) {
        try {
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
                        limit: 10,
                        order: [['CreatedAt', 'DESC']]
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get dealer purchases
     */
    async getDealerPurchases(dealerId, filters = {}) {
        try {
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
        } catch (error) {
            throw error;
        }
    }

    // Private methods
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
    }

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

    async notifyDealer(purchase, type) {
        try {
            const dealer = await ExplosiveDealer.findByPk(purchase.DealerID);
            const store = await ExplosiveStore.findByPk(purchase.StoreID);

            const emailContent = this.generateEmailContent(type, {
                purchase,
                dealer,
                store
            });

            await sendEmail({
                to: dealer.Email,
                subject: emailContent.subject,
                html: emailContent.body
            });
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    async notifyStatusChange(purchase, status) {
        try {
            const store = await ExplosiveStore.findByPk(purchase.StoreID);
            const dealer = await ExplosiveDealer.findByPk(purchase.DealerID);

            const emailContent = this.generateStatusEmailContent(status, {
                purchase,
                store,
                dealer
            });

            // Notify both store and dealer
            await Promise.all([
                sendEmail({
                    to: store.ContactEmail,
                    subject: emailContent.storeSubject,
                    html: emailContent.storeBody
                }),
                sendEmail({
                    to: dealer.Email,
                    subject: emailContent.dealerSubject,
                    html: emailContent.dealerBody
                })
            ]);
        } catch (error) {
            console.error('Status notification error:', error);
        }
    }

    generateEmailContent(type, data) {
        const templates = {
            new_order: {
                subject: `New Purchase Order - ${data.store.StoreName}`,
                body: `
                    <h2>New Purchase Order</h2>
                    <p>A new purchase order has been created:</p>
                    <ul>
                        <li>Order ID: ${data.purchase.PurchaseID}</li>
                        <li>Store: ${data.store.StoreName}</li>
                        <li>Total Amount: ${data.purchase.TotalAmount}</li>
                    </ul>
                `
            }
            // Add more email templates as needed
        };

        return templates[type];
    }
}

module.exports = new PurchaseService();