const purchaseService = require('../services/purchase.service');
const { BadRequestError, NotFoundError } = require('../utils/errors');

// Create purchase order
exports.createPurchase = async (req, res) => {
    try {
        // Validate input data
        const validationErrors = validatePurchaseData(req.body);
        if (validationErrors.length > 0) {
            throw new BadRequestError('Validation failed', validationErrors);
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
        console.log(error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message,
            errors: error.errors
        });
    }
};

// Dealer confirms purchase
exports.confirmPurchase = async (req, res) => {
    try {
        // Validate confirmation data
        const validationErrors = validateConfirmationData(req.body);
        if (validationErrors.length > 0) {
            throw new BadRequestError('Validation failed', validationErrors);
        }

        const purchase = await purchaseService.confirmPurchase(
            req.params.purchaseId,
            req.body.items,
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Purchase order confirmed successfully',
            data: purchase
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message,
            errors: error.errors
        });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        // Validate delivery data
        const validationErrors = validateDeliveryData(req.body);
        if (validationErrors.length > 0) {
            throw new BadRequestError('Validation failed', validationErrors);
        }

        const purchase = await purchaseService.updateDeliveryStatus(
            req.params.purchaseId,
            {
                items: req.body.items,
                deliveryDate: req.body.deliveryDate
            },
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Delivery status updated successfully',
            data: purchase
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message,
            errors: error.errors
        });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, paymentReference } = req.body;

        // Handle payment proof upload if provided
        let paymentProofURL = null;
        if (req.file) {
            paymentProofURL = req.file.path; // Assuming file path is handled by upload middleware
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
            message: error.message,
            errors: error.errors
        });
    }
};

// Get purchase details
exports.getPurchaseDetails = async (req, res) => {
    try {
        const purchase = await purchaseService.getPurchaseDetails(req.params.purchaseId);
        
        if (!purchase) {
            throw new NotFoundError('Purchase not found');
        }

        res.json({
            status: 'success',
            data: purchase
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get dealer purchases
exports.getDealerPurchases = async (req, res) => {
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
            message: error.message
        });
    }
};

// Get store purchases
exports.getStorePurchases = async (req, res) => {
    try {
        const purchases = await purchaseService.getStorePurchases(
            req.params.storeId,
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
            message: error.message
        });
    }
};

// Validation helper functions
const validatePurchaseData = (data) => {
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
            if (!item.explosiveTypeId || !item.quantity) {
                errors.push('Each item must have explosiveTypeID and quantity');
            }
            if (item.quantity <= 0) {
                errors.push('Quantity must be greater than zero');
            }
        }
    }

    return errors;
};

const validateConfirmationData = (data) => {
    const errors = [];

    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Item details are required');
    } else {
        for (const item of data.items) {
            if (!item.explosiveTypeID || !item.unitPrice || !item.batchNumber) {
                errors.push('Each item must have explosiveTypeID, unitPrice, and batchNumber');
            }
            if (item.unitPrice <= 0) {
                errors.push('Unit price must be greater than zero');
            }
            if (!item.manufactureDate || !item.expiryDate) {
                errors.push('Manufacture date and expiry date are required');
            }
        }
    }

    return errors;
};

const validateDeliveryData = (data) => {
    const errors = [];

    if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Delivery items are required');
    } else {
        for (const item of data.items) {
            if (!item.explosiveTypeID || typeof item.receivedQuantity !== 'number') {
                errors.push('Each item must have explosiveTypeID and receivedQuantity');
            }
            if (item.receivedQuantity < 0) {
                errors.push('Received quantity cannot be negative');
            }
        }
    }

    return errors;
};