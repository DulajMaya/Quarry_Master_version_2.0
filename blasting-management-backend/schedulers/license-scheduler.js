const cron = require('node-cron');
const explosiveStoreService = require('../services/explosive-store.service');
const notificationService = require('../notifications/services/notification.service');

const checkStoreLicenses = async () => {
    try {
        const expiringStores = await explosiveStoreService.checkStoreLicenseStatus();
        
        if (expiringStores.length > 0) {
            await notificationService.sendPermitExpiryNotice(
                expiringStores.map(store => ({
                    permitNumber: store.licenseNumber,
                    issueDate: store.licenseIssueDate,
                    expiryDate: store.licenseExpiryDate,
                    daysRemaining: store.daysRemaining,
                    critical: store.daysRemaining <= 7
                }))
            );
            console.log(`License expiry notifications sent for ${expiringStores.length} stores`);
        }
    } catch (error) {
        console.error('License check error:', error);
    }
};

const init = () => {
    // Run daily at midnight
    cron.schedule('0 0 * * *', checkStoreLicenses);
    
    // Run weekly comprehensive check on Sunday at 1 AM
    cron.schedule('0 1 * * 0', async () => {
        try {
            const allStores = await explosiveStoreService.getAllExplosiveStores();
            
            await notificationService.createNotification({
                type: 'SYSTEM',
                title: 'Weekly License Status Report',
                message: 'Weekly license status report is available',
                priority: 'MEDIUM',
                deliveryType: 'EMAIL',
                emailTemplate: 'LICENSE_REPORT',
                emailData: {
                    stores: allStores,
                    reportDate: new Date().toLocaleDateString()
                },
                recipients: await notificationService.getRecipientsByRole([
                    'SITE_ENGINEER', 
                    'EXPLOSIVE_CONTROLLER'
                ])
            });
        } catch (error) {
            console.error('Weekly license report error:', error);
        }
    });

    console.log('License scheduler initialized');
};

module.exports = {
    init,
    checkStoreLicenses
};