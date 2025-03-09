// Define all socket events as constants
const SOCKET_EVENTS = {
    // Connection events
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // Authentication events
    FORCE_LOGOUT: 'force_logout',
    SESSION_EXPIRED: 'session_expired',

    // User events
    USER_STATUS_CHANGED: 'user_status_changed',
    USER_DELETED: 'user_deleted',

    // Notification events
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification_read',

    // Permit events
    PERMIT_STATUS_CHANGED: 'permit_status_changed',
    PERMIT_UPDATED: 'permit_updated',

    // Store events
    STORE_INVENTORY_UPDATED: 'store_inventory_updated',
    LOW_STOCK_ALERT: 'low_stock_alert',

    // Purchase events
    PURCHASE_STATUS_CHANGED: 'purchase_status_changed',
    PURCHASE_UPDATED: 'purchase_updated'
};

// Event handlers mapping
const EVENT_HANDLERS = {
    [SOCKET_EVENTS.NOTIFICATION_READ]: 'handleNotificationRead',
    [SOCKET_EVENTS.PERMIT_STATUS_CHANGED]: 'handlePermitStatusChange',
    [SOCKET_EVENTS.STORE_INVENTORY_UPDATED]: 'handleInventoryUpdate',
    [SOCKET_EVENTS.PURCHASE_STATUS_CHANGED]: 'handlePurchaseStatusChange'
};

module.exports = {
    SOCKET_EVENTS,
    EVENT_HANDLERS
};