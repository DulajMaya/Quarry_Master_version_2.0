// notifications/config/notification.config.js
/*
const path = require('path');

module.exports = {
    // Email Configuration
    email: {
        // SMTP Settings
        smtp: {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: true
            }
        },

        // Sender Details
        from: `"Quarry Master" <${process.env.EMAIL_USER}>`,

        // Template Settings
        templates: {
            directory: path.join(__dirname, '../templates/emails'),
            layouts: path.join(__dirname, '../templates/emails/layouts'),
            partials: path.join(__dirname, '../templates/emails/partials'),
            defaultLayout: 'main',
            extension: '.hbs'
        }
    },

    // Notification Settings
    notification: {
        // Retry Configuration
        retry: {
            maxAttempts: 3,
            delay: 1000 // 1 second between retries
        },

        // Batch Processing
        batch: {
            size: 50,  // Maximum emails per batch
            delay: 1000 // Delay between batches
        }
    }
};*/