// purchase.routes.js
/*
const router = require('express').Router();
const purchaseController = require('../controllers/purchase.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyStoreAccess, verifyDealerAccess } = require('../middleware/access-control.middleware');
const  {upload}  = require('../middleware/upload.middleware');

/**
 * @route   POST /api/purchases
 * @desc    Create new purchase order
 * @access  Private - Site Engineer
 
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    purchaseController.createPurchase
);

/**
 * @route   GET /api/purchases/:purchaseId
 * @desc    Get purchase details
 * @access  Private - Site Engineer, Dealer
 
router.get('/:purchaseId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_DEALER]),
        verifyStoreAccess
    ],
    purchaseController.getPurchaseDetails
);

/**
 * @route   PATCH /api/purchases/:purchaseId/status
 * @desc    Update purchase status
 * @access  Private - Dealer (confirm/deliver), Site Engineer (cancel)
 
router.patch('/:purchaseId/status',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER, ROLES.SITE_ENGINEER]),
        verifyDealerAccess,
        upload.single('receipt')
    ],
    purchaseController.updatePurchaseStatus
);

/**
 * @route   PATCH /api/purchases/:purchaseId/payment
 * @desc    Update payment status
 * @access  Private - Site Engineer, Dealer
 
router.patch('/:purchaseId/payment',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_DEALER]),
        upload.single('paymentProof')
    ],
    purchaseController.updatePaymentStatus
);

/**
 * @route   GET /api/purchases/dealer/:dealerId
 * @desc    Get dealer's purchases
 * @access  Private - Dealer
 
router.get('/dealer/:dealerId',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER]),
        verifyDealerAccess
    ],
    purchaseController.getDealerPurchases
);

/**
 * @route   POST /api/purchases/:purchaseId/documents
 * @desc    Upload purchase document
 * @access  Private - Site Engineer, Dealer
 
router.post('/:purchaseId/documents',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_DEALER]),
        upload.single('document')
    ],
    purchaseController.uploadDocument
);

/**
 * @route   GET /api/purchases/dealer/:dealerId/summary
 * @desc    Get dealer purchase summary
 * @access  Private - Dealer, Admin
 
router.get('/dealer/:dealerId/summary',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER, ROLES.ADMIN]),
        verifyDealerAccess
    ],
    purchaseController.getPurchaseSummary
);

/**
 * @route   GET /api/purchases/store/:storeId
 * @desc    Get store purchases
 * @access  Private - Site Engineer
 
router.get('/store/:storeId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    async (req, res) => {
        try {
            const filters = {
                status: req.query.status,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };

            const purchases = await purchaseController.getStorePurchases(
                req.params.storeId,
                filters
            );

            res.json({
                status: 'success',
                data: purchases
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving store purchases'
            });
        }
    }
);

/**
 * @route   GET /api/purchases/pending-delivery
 * @desc    Get purchases pending delivery
 * @access  Private - Dealer
 
router.get('/pending-delivery',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER])
    ],
    async (req, res) => {
        try {
            const purchases = await purchaseController.getPendingDeliveries(
                req.dealerId
            );

            res.json({
                status: 'success',
                data: purchases
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving pending deliveries'
            });
        }
    }
);

/**
 * @route   POST /api/purchases/:purchaseId/confirm-receipt
 * @desc    Confirm receipt of purchase
 * @access  Private - Site Engineer
 
router.post('/:purchaseId/confirm-receipt',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    async (req, res) => {
        try {
            const purchase = await purchaseController.confirmReceipt(
                req.params.purchaseId,
                req.body.items,
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Purchase receipt confirmed successfully',
                data: purchase
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error confirming receipt'
            });
        }
    }
);

/**
 * @route   GET /api/purchases/reports/monthly
 * @desc    Get monthly purchase report
 * @access  Private - Admin
 
router.get('/reports/monthly',
    [
        verifyToken,
        hasRole([ROLES.ADMIN])
    ],
    async (req, res) => {
        try {
            const report = await purchaseController.generateMonthlyReport(
                req.query.month,
                req.query.year
            );

            res.json({
                status: 'success',
                data: report
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating report'
            });
        }
    }
);

/**
 * @route   POST /api/purchases/bulk-validate
 * @desc    Validate multiple purchase requests
 * @access  Private - Site Engineer
 
router.post('/bulk-validate',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER])
    ],
    async (req, res) => {
        try {
            const validationResults = await purchaseController.validateBulkPurchases(
                req.body.purchases
            );

            res.json({
                status: 'success',
                data: validationResults
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error validating purchases'
            });
        }
    }
);

module.exports = router;*/

const router = require('express').Router();
const purchaseController = require('../controllers/purchase.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { verifyStoreAccess, verifyDealerAccess } = require('../middleware/access-control.middleware');
const { upload, paymentProofUpload } = require('../middleware/upload.middleware');

/**
 * GET Routes (Ordered by specificity)
 */
// Get dealer's purchases (most specific)
router.get('/dealer/:dealerId',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER]),
    ],
    purchaseController.getDealerPurchases
);

// Get store purchases (more specific)
router.get('/store/:storeId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    purchaseController.getStorePurchases
);

// Get single purchase (least specific)
router.get('/:purchaseId',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_DEALER]),
        //verifyStoreAccess if needed make proper way for dealer not works thats why comment this
    ],
    purchaseController.getPurchaseDetails
);

/**
 * POST/PATCH Routes
 */
// Create purchase order
router.post('/',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER]),
        verifyStoreAccess
    ],
    purchaseController.createPurchase
);

// Confirm purchase with prices
router.post('/:purchaseId/confirm',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER]),
        verifyDealerAccess
    ],
    purchaseController.confirmPurchase
);

// Upload documents
/*
router.post('/:purchaseId/documents',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_DEALER]),
        upload.single('document')
    ],
    purchaseController.uploadDocument
);*/

// Update delivery status
router.patch('/:purchaseId/delivery',
    [
        verifyToken,
        hasRole([ROLES.EXPLOSIVE_DEALER]),
        verifyDealerAccess
    ],
    purchaseController.updateDeliveryStatus
);

// Update payment status
router.patch('/:purchaseId/payment',
    [
        verifyToken,
        hasRole([ROLES.SITE_ENGINEER, ROLES.EXPLOSIVE_DEALER]),
        paymentProofUpload.single('paymentProof')
    ],
    purchaseController.updatePaymentStatus
);

module.exports = router;