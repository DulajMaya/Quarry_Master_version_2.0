// purchase.controller.js

const purchaseService = require('../services/purchase.service');
const { upload } = require('../utils/upload.util');

class PurchaseController {
    /**
     * Create new purchase order
     * @route POST /api/purchases
     */
    async createPurchase(req, res) {
        try {
            // Validate input data
            const validationErrors = await this.validatePurchaseData(req.body);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const purchase = await purchaseService.createPurchase(
                {
                    quotaId: req.body.quotaId,
                    dealerId: req.body.dealerId,
                    storeId: req.body.storeId,
                    paymentMethod: req.body.paymentMethod,
                    notes: req.body.notes,
                    items: req.body.items
                },
                req.userId
            );

            res.status(201).json({
                status: 'success',
                message: 'Purchase order created successfully',
                data: purchase
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error creating purchase order'
            });
        }
    }

    /**
     * Update purchase status
     * @route PATCH /api/purchases/:purchaseId/status
     */
    async updatePurchaseStatus(req, res) {
        try {
            const { status, receiptNumber, reason } = req.body;

            // Validate status transition
            const validationError = await this.validateStatusTransition(
                req.params.purchaseId,
                status,
                req.userRole
            );
            
            if (validationError) {
                return res.status(400).json({
                    status: 'error',
                    message: validationError
                });
            }

            // Handle receipt photo upload if provided
            let receiptPhotoURL = null;
            if (req.files && req.files.receipt) {
                receiptPhotoURL = await upload(
                    req.files.receipt,
                    'purchase-receipts',
                    req.params.purchaseId
                );
            }

            const purchase = await purchaseService.updatePurchaseStatus(
                req.params.purchaseId,
                status,
                {
                    receiptNumber,
                    receiptPhotoURL,
                    reason,
                    items: req.body.items // For delivery confirmation
                },
                req.userId
            );

            res.json({
                status: 'success',
                message: `Purchase ${status.toLowerCase()} successfully`,
                data: purchase
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating purchase status'
            });
        }
    }

    /**
     * Update payment status
     * @route PATCH /api/purchases/:purchaseId/payment
     */
    async updatePaymentStatus(req, res) {
        try {
            const { paymentStatus, paymentReference } = req.body;

            // Handle payment proof upload if provided
            let paymentProofURL = null;
            if (req.files && req.files.paymentProof) {
                paymentProofURL = await upload(
                    req.files.paymentProof,
                    'payment-proofs',
                    req.params.purchaseId
                );
            }

            const purchase = await purchaseService.updatePaymentStatus(
                req.params.purchaseId,
                paymentStatus,
                {
                    paymentReference,
                    paymentProofURL
                },
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Payment status updated successfully',
                data: purchase
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating payment status'
            });
        }
    }

    /**
     * Get purchase details
     * @route GET /api/purchases/:purchaseId
     */
    async getPurchaseDetails(req, res) {
        try {
            const purchase = await purchaseService.getPurchaseDetails(req.params.purchaseId);
            
            if (!purchase) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Purchase not found'
                });
            }

            res.json({
                status: 'success',
                data: purchase
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving purchase details'
            });
        }
    }

    /**
     * Get dealer purchases
     * @route GET /api/purchases/dealer/:dealerId
     */
    async getDealerPurchases(req, res) {
        try {
            const purchases = await purchaseService.getDealerPurchases(
                req.params.dealerId,
                {
                    status: req.query.status,
                    startDate: req.query.startDate,
                    endDate: req.query.endDate
                }
            );

            res.json({
                status: 'success',
                data: purchases
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving dealer purchases'
            });
        }
    }

    /**
     * Upload purchase document
     * @route POST /api/purchases/:purchaseId/documents
     */
    async uploadDocument(req, res) {
        try {
            if (!req.files || !req.files.document) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No document uploaded'
                });
            }

            const documentURL = await upload(
                req.files.document,
                'purchase-documents',
                req.params.purchaseId
            );

            const document = await purchaseService.uploadDocument(
                req.params.purchaseId,
                {
                    type: req.body.documentType,
                    url: documentURL,
                    description: req.body.description
                },
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Document uploaded successfully',
                data: document
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error uploading document'
            });
        }
    }

    /**
     * Get purchase summary
     * @route GET /api/purchases/dealer/:dealerId/summary
     */
    async getPurchaseSummary(req, res) {
        try {
            const summary = await purchaseService.generatePurchaseSummary(
                req.params.dealerId,
                req.query.startDate,
                req.query.endDate
            );

            res.json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating summary'
            });
        }
    }

    /**
     * Validate purchase data
     * @private
     */
    async validatePurchaseData(data) {
        const errors = [];

        if (!data.quotaId) {
            errors.push('Quota ID is required');
        }

        if (!data.dealerId) {
            errors.push('Dealer ID is required');
        }

        if (!data.storeId) {
            errors.push('Store ID is required');
        }

        if (!data.paymentMethod) {
            errors.push('Payment method is required');
        }

        if (!Array.isArray(data.items) || data.items.length === 0) {
            errors.push('At least one item is required');
        } else {
            for (const item of data.items) {
                if (!item.explosiveTypeId || !item.quantity || !item.unitPrice) {
                    errors.push('Invalid item data provided');
                    break;
                }
                if (item.quantity <= 0) {
                    errors.push('Quantity must be greater than zero');
                    break;
                }
                if (item.unitPrice <= 0) {
                    errors.push('Unit price must be greater than zero');
                    break;
                }
            }
        }

        return errors;
    }

    /**
     * Validate status transition
     * @private
     */
    async validateStatusTransition(purchaseId, newStatus, userRole) {
        const purchase = await purchaseService.getPurchaseDetails(purchaseId);
        if (!purchase) return 'Purchase not found';

        const allowedTransitions = {
            'Pending': ['Confirmed', 'Cancelled', 'Rejected'],
            'Confirmed': ['Delivered', 'Cancelled'],
            'Delivered': [],
            'Cancelled': [],
            'Rejected': []
        };

        if (!allowedTransitions[purchase.Status].includes(newStatus)) {
            return `Cannot transition from ${purchase.Status} to ${newStatus}`;
        }

        const rolePermissions = {
            'ROLE_ADMIN': ['Cancelled', 'Rejected'],
            'ROLE_EXPLOSIVE_DEALER': ['Confirmed', 'Delivered'],
            'ROLE_SITE_ENGINEER': ['Cancelled']
        };

        if (!rolePermissions[userRole]?.includes(newStatus)) {
            return 'Unauthorized to perform this status change';
        }

        return null;
    }
}

module.exports = new PurchaseController();