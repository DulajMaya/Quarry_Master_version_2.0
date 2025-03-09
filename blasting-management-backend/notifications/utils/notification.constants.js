// notifications/utils/notification.constants.js
/*
const NOTIFICATION_TYPES = {
    LOW_STOCK: 'LOW_STOCK',
    PERMIT_STATUS: 'PERMIT_STATUS',
    PERMIT_EXPIRY: 'PERMIT_EXPIRY',
    QUOTA_STATUS: 'QUOTA_STATUS',
    QUOTA_EXPIRY: 'QUOTA_EXPIRY',
    PURCHASE_STATUS: 'PURCHASE_STATUS',
    PAYMENT_STATUS: 'PAYMENT_STATUS'
};

const EMAIL_TEMPLATES = {
    LOW_STOCK_ALERT: {
        name: 'low-stock-alert',
        subject: 'Low Stock Alert - Action Required'
    },
    PERMIT_STATUS: {
        name: 'permit-status',
        subject: 'Permit Status: {status}'
    },
    PERMIT_EXPIRY: {
        name: 'permit-expiry',
        subject: 'Explosive Permit Expiry Notice'
    },
    QUOTA_STATUS: {
        name: 'quota-status',
        subject: 'Weekly Quota Request: {status}'
    },
    QUOTA_EXPIRY: {
        name: 'quota-expiry',
        subject: 'Quota Expiry Notice'
    },
    PURCHASE_STATUS: {
        name: 'purchase-status',
        subject: 'Purchase Order {status}'
    },
    PAYMENT_STATUS: {
        name: 'payment-status',
        subject: 'Payment Status Updated: {status}'
    }
};

const NOTIFICATION_STATUS = {
    UNREAD: 'UNREAD',
    READ: 'READ',
    ARCHIVED: 'ARCHIVED'
};

const NOTIFICATION_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
};

const DELIVERY_TYPES = {
    EMAIL: 'EMAIL',
    SYSTEM: 'SYSTEM',
    BOTH: 'BOTH'
};

module.exports = {
    NOTIFICATION_TYPES,
    EMAIL_TEMPLATES,
    NOTIFICATION_STATUS,
    NOTIFICATION_PRIORITY,
    DELIVERY_TYPES
};*/

// notifications/utils/notification.constants.js

// Notification Types
const NOTIFICATION_TYPES = {
    LOW_STOCK: 'LOW_STOCK',
    USER_CREDENTIALS: 'USER_CREDENTIALS',
    PERMIT_STATUS: 'PERMIT_STATUS',    // For permit creation/updates
    PERMIT_EXPIRY: 'PERMIT_EXPIRY',    // For expiring permits
    QUOTA_STATUS: 'QUOTA_STATUS',      // For quota approval/rejection
    PURCHASE_STATUS: 'PURCHASE_STATUS', // For purchase order updates
    PAYMENT_STATUS: 'PAYMENT_STATUS',   // For payment confirmations
    SYSTEM: 'SYSTEM'                   // For system notifications
};

// Email Templates
const EMAIL_TEMPLATES = {
    LOW_STOCK_ALERT: {
        name: 'low-stock-alert',
        subject: 'Low Stock Alert - Action Required'
    },
    PERMIT_STATUS: {
        name: 'permit-status',
        subject: 'Permit {status} - {permitNumber}'
    },
    PERMIT_EXPIRY: {
        name: 'permit-expiry',
        subject: 'Permit Expiry Notice - {permitNumber}'
    },
    QUOTA_STATUS: {
        name: 'quota-status',
        subject: 'Weekly Quota Request {status}'
    },
    PURCHASE_STATUS: {
        name: 'purchase-status',
        subject: 'Purchase Order {status}'
    },
    /*PAYMENT_STATUS: {
        name: 'payment-status',
        subject: 'Payment Status Update - {status}'
    },*/

    PURCHASE_CREATED: {
        name: 'purchase-created',
        subject: 'New Purchase Order - {purchaseId}'
    },
    PURCHASE_CONFIRMED: {
        name: 'purchase-confirmed',
        subject: 'Purchase Order Confirmed - {purchaseId}'
    },
    PURCHASE_DELIVERED: {
        name: 'purchase-delivered',
        subject: 'Purchase Order Delivered - {purchaseId}'
    },
    PAYMENT_STATUS: {
        name: 'payment-status',
        subject: 'Payment {status} - Purchase Order {purchaseId}'
    },

    USER_CREDENTIALS: {
        name: 'user-credentials',
        subject: 'Your Quarry Master Account Credentials'
    }




};

// Notification Status
const NOTIFICATION_STATUS = {
    UNREAD: 'UNREAD',
    READ: 'READ',
    ARCHIVED: 'ARCHIVED'
};

// Priority Levels
const NOTIFICATION_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH'
};

// Delivery Methods
const DELIVERY_TYPES = {
    EMAIL: 'EMAIL',
    SYSTEM: 'SYSTEM',
    BOTH: 'BOTH'
};

// Reference Types
const REFERENCE_TYPES = {
    STORE: 'STORE',
    PERMIT: 'PERMIT',
    QUOTA: 'QUOTA',
    PURCHASE: 'PURCHASE'
};

// Purchase Status Types (New)
const PURCHASE_STATUS_TYPES = {
    CREATED: 'Created',
    CONFIRMED: 'Confirmed',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected'
};

// Payment Status Types (New)
const PAYMENT_STATUS_TYPES = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    FAILED: 'Failed'
};




module.exports = {
    NOTIFICATION_TYPES,
    EMAIL_TEMPLATES,
    NOTIFICATION_STATUS,
    NOTIFICATION_PRIORITY,
    DELIVERY_TYPES,
    REFERENCE_TYPES,
    PURCHASE_STATUS_TYPES,  // Added
    PAYMENT_STATUS_TYPES
};