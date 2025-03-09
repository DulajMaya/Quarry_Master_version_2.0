// schedulers/inventory-scheduler.js
const cron = require('node-cron');
const storeInventoryService = require('../services/store-inventory.service');
const notificationService = require('../notifications/services/notification.service');

const checkLowStock = async () => {
    try {
        const lowStockItems = await storeInventoryService.checkLowStockLevels();
        
        if (lowStockItems.length > 0) {
            // Using new notification service instead of helper
            await notificationService.sendLowStockAlert(
                lowStockItems[0].storeId, // Assuming all items are from same store
                lowStockItems.map(item => ({
                    explosiveType: item.explosiveType,
                    currentQuantity: item.currentQuantity,
                    minimumLevel: item.minimumLevel,
                    status: item.currentQuantity === 0 ? 'Critical' : 'Low',
                    critical: item.currentQuantity === 0
                }))
            );
            console.log(`Low stock notifications sent for ${lowStockItems.length} items`);
        }
    } catch (error) {
        console.error('Low stock check error:', error);
    }
};

const init = () => {
    // Check stock levels every 6 hours
    cron.schedule('0 */6 * * *', checkLowStock);
    
    // Generate daily inventory report at 11 PM
    cron.schedule('0 23 * * *', async () => {
        try {
            const dailyReport = await storeInventoryService.generateDailyReport();
            
            // Using notification service for daily report
            await notificationService.createNotification({
                type: 'SYSTEM',
                title: 'Daily Inventory Report',
                message: 'Daily inventory report is available',
                priority: 'MEDIUM',
                deliveryType: 'EMAIL',
                referenceType: 'REPORT',
                referenceId: dailyReport.id,
                emailTemplate: 'INVENTORY_REPORT',
                emailData: {
                    report: dailyReport,
                    date: new Date().toLocaleDateString()
                },
                recipients: await notificationService.getRecipientsByRole(['SITE_ENGINEER'])
            });
        } catch (error) {
            console.error('Daily inventory report error:', error);
        }
    });

    console.log('Inventory scheduler initialized');
};

module.exports = {
    init,
    checkLowStock
};