const nodemailer = require('nodemailer');
// Assuming you have email configuration in your env variables

const sendLicenseExpiryNotifications = async (expiringStores) => {
    try {
        for (const store of expiringStores) {
            const emailContent = {
                to: store.MiningSite.contactEmail, // Assuming this exists
                subject: `Store License Expiring Soon - ${store.StoreName}`,
                html: `
                    <h2>Store License Expiry Notice</h2>
                    <p>Store: ${store.StoreName}</p>
                    <p>License Number: ${store.LicenseNumber}</p>
                    <p>Expiry Date: ${store.LicenseExpiryDate}</p>
                    <p>Please take necessary action to renew the license.</p>
                `
            };

            await sendEmail(emailContent);
        }
    } catch (error) {
        console.error('Error sending license notifications:', error);
        throw error;
    }
};

const sendLowStockNotifications = async (lowStockItems) => {
    try {
        // Group items by store
        const storeGroupedItems = lowStockItems.reduce((acc, item) => {
            if (!acc[item.StoreID]) {
                acc[item.StoreID] = [];
            }
            acc[item.StoreID].push(item);
            return acc;
        }, {});

        // Send notification for each store
        for (const [storeId, items] of Object.entries(storeGroupedItems)) {
            const emailContent = {
                to: items[0].Store.contactEmail, // Assuming this exists
                subject: `Low Stock Alert - ${items[0].Store.StoreName}`,
                html: generateLowStockEmailTemplate(items)
            };

            await sendEmail(emailContent);
        }
    } catch (error) {
        console.error('Error sending low stock notifications:', error);
        throw error;
    }
};

// Helper function to send emails
const sendEmail = async (emailContent) => {
    const transporter = nodemailer.createTransport({
        // Your email configuration here
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        ...emailContent
    });
};

module.exports = {
    sendLicenseExpiryNotifications,
    sendLowStockNotifications,
    sendWeeklyLicenseReport: async () => {/* Implement as needed */},
    sendDailyInventoryReport: async () => {/* Implement as needed */}
};