// config/email.config.js
/*
const nodemailer = require('nodemailer');
const hbs =require('nodemailer-express-handlebars');  // need to use older version 
const path = require('path');

// Email configuration
const emailConfig = {
    // SMTP Configuration
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Configure handlebar options
const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('./views/emails/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views/emails/'),
    extName: '.hbs'
};

// Use template engine
transporter.use('compile', hbs(handlebarOptions));

// Test email connection
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error hh:', error);
    } else {
        console.log('Email server is ready to take messages');
    }
});

// Email sending function
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Quarry Master" <noreply@quarrymaster.com>',
            to: options.to,
            subject: options.subject,
            template: options.template,
            context: options.context
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

// Predefined email types with their templates
const EMAIL_TYPES = {
    LOW_STOCK_ALERT: {
        template: 'low-stock-alert',
        subject: 'Low Stock Alert - Action Required'
    },
    PERMIT_EXPIRY: {
        template: 'permit-expiry',
        subject: 'Explosive Permit Expiry Notice'
    },
    QUOTA_APPROVAL: {
        template: 'quota-approval',
        subject: 'Weekly Quota Request {status}'
    },
    PURCHASE_ORDER: {
        template: 'purchase-order',
        subject: 'Purchase Order {status}'
    },
    USER_ACCOUNT: {
        template: 'user-account',
        subject: 'Account {action} - Quarry Master'
    }
};

// Retry mechanism for failed emails
const sendEmailWithRetry = async (options, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await sendEmail(options);
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// Bulk email sending with rate limiting
const sendBulkEmails = async (emailsList, rateLimit = 50) => {
    const results = [];
    
    for (let i = 0; i < emailsList.length; i += rateLimit) {
        const batch = emailsList.slice(i, i + rateLimit);
        const promises = batch.map(email => sendEmailWithRetry(email));
        
        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults);

        if (i + rateLimit < emailsList.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
};

module.exports = {
    transporter,
    sendEmail,
    sendEmailWithRetry,
    sendBulkEmails,
    EMAIL_TYPES
}; */

/*
// Add after the existing code in email.config.js

// Predefined email types with their templates
const EMAIL_TYPES = {
    // Inventory related
    LOW_STOCK_ALERT: {
        template: 'low-stock-alert',
        subject: 'Low Stock Alert - Action Required'
    },
    INVENTORY_UPDATE: {
        template: 'inventory-update',
        subject: 'Inventory Update Notification'
    },

    // Permit related
    PERMIT_EXPIRY: {
        template: 'permit-expiry',
        subject: 'Explosive Permit Expiry Notice'
    },
    PERMIT_STATUS: {
        template: 'permit-status',
        subject: 'Permit Application Status Update'
    },

    // Quota related
    QUOTA_REQUEST: {
        template: 'quota-request',
        subject: 'New Weekly Quota Request'
    },
    QUOTA_STATUS: {
        template: 'quota-status',
        subject: 'Quota Request Status Update'
    },

    // Purchase related
    PURCHASE_ORDER: {
        template: 'purchase-order',
        subject: 'New Purchase Order'
    },
    PURCHASE_STATUS: {
        template: 'purchase-status',
        subject: 'Purchase Order Status Update'
    },
    DELIVERY_NOTIFICATION: {
        template: 'delivery-notification',
        subject: 'Delivery Update'
    },

    // User account related
    USER_REGISTRATION: {
        template: 'user-registration',
        subject: 'Welcome to Quarry Master'
    },
    ACCOUNT_STATUS: {
        template: 'account-status',
        subject: 'Account Status Update'
    },
    PASSWORD_RESET: {
        template: 'password-reset',
        subject: 'Password Reset Request'
    }
};

// Add retry mechanism for failed emails
const sendEmailWithRetry = async (options, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await sendEmail(options);
        } catch (error) {
            console.log(`Email sending attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            // Exponential backoff: wait longer between each retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// Export all functions and constants
module.exports = {
    transporter,
    sendEmail,
    sendEmailWithRetry,
    EMAIL_TYPES
};*/

/*// config/email.config.js
const nodemailer = require('nodemailer');
const path = require('path');

// We'll import handlebars differently
const handlebars = require('express-handlebars');
const nodemailerHbs = require('nodemailer-express-handlebars');

// Email configuration
const emailConfig = {
    // SMTP Configuration
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Configure handlebar options
const handlebarOptions = {
    viewEngine: handlebars.create({
        extName: '.hbs',
        layoutsDir: path.resolve('./views/emails/'),
        defaultLayout: false,
        partialsDir: path.resolve('./views/emails/')
    }),
    viewPath: path.resolve('./views/emails/'),
    extName: '.hbs'
};

// Use template engine
transporter.use('compile', nodemailerHbs(handlebarOptions));

// Rest of your code remains the same
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Quarry Master" <noreply@quarrymaster.com>',
            to: options.to,
            subject: options.subject,
            template: options.template,
            context: options.context
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        throw error;
    }
};

// Your EMAIL_TYPES object remains the same
const EMAIL_TYPES = {
    LOW_STOCK_ALERT: {
        template: 'low-stock-alert',
        subject: 'Low Stock Alert - Action Required'
    },
    PERMIT_EXPIRY: {
        template: 'permit-expiry',
        subject: 'Explosive Permit Expiry Notice'
    },
    QUOTA_APPROVAL: {
        template: 'quota-approval',
        subject: 'Weekly Quota Request {status}'
    },
    PURCHASE_ORDER: {
        template: 'purchase-order',
        subject: 'Purchase Order {status}'
    },
    USER_ACCOUNT: {
        template: 'user-account',
        subject: 'Account {action} - Quarry Master'
    }
};

// Retry mechanism remains the same
const sendEmailWithRetry = async (options, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await sendEmail(options);
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

// Bulk email sending remains the same
const sendBulkEmails = async (emailsList, rateLimit = 50) => {
    const results = [];
    
    for (let i = 0; i < emailsList.length; i += rateLimit) {
        const batch = emailsList.slice(i, i + rateLimit);
        const promises = batch.map(email => sendEmailWithRetry(email));
        
        const batchResults = await Promise.allSettled(promises);
        results.push(...batchResults);

        if (i + rateLimit < emailsList.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
};

module.exports = {
    transporter,
    sendEmail,
    sendEmailWithRetry,
    sendBulkEmails,
    EMAIL_TYPES
}; */