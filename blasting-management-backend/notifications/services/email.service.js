// notifications/services/email.service.js
/*
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { EMAIL_TEMPLATES } = require('../utils/notification.constants');
const NotificationLog = require('../models/notification-log.model');

class EmailService {
    constructor() {
        this.transporter = this.createTransporter();
        this.setupTemplateEngine();
    }

    createTransporter() {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        // Verify connection
        transporter.verify((error) => {
            if (error) {
                console.error('Email configuration error:', error);
            } else {
                console.log('Email service is ready');
            }
        });

        return transporter;
    }

    setupTemplateEngine() {
        const handlebarOptions = {
            viewEngine: {
                extName: '.hbs',
                partialsDir: path.resolve('./notifications/templates/emails/'),
                defaultLayout: 'main',
                layoutsDir: path.resolve('./notifications/templates/emails/layouts/')
            },
            viewPath: path.resolve('./notifications/templates/emails/'),
            extName: '.hbs'
        };

        this.transporter.use('compile', hbs(handlebarOptions));
    }

    async sendEmail(options, notificationId = null) {
        try {
            const template = EMAIL_TEMPLATES[options.template];
            if (!template) {
                console.log('h')
                throw new Error(`Template ${options.template} not found`);
            }

            const mailOptions = {
                from: `"Quarry Master" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: this.processSubject(template.subject, options.subjectData),
                template: template.name,
                context: {
                    ...options.data,
                    year: new Date().getFullYear()
                }
            };

            const info = await this.transporter.sendMail(mailOptions);

            if (notificationId) {
                await this.logEmailSent(notificationId, info.messageId, options);
            }

            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            if (notificationId) {
                await this.logEmailError(notificationId, error, options);
            }
            throw error;
        }
    }

    processSubject(subject, data = {}) {
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            if (subject.includes(placeholder)) {
                subject = subject.replace(placeholder, data[key]);
            }
        });
        return subject;
    }

    async sendEmailWithRetry(options, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.sendEmail(options);
            } catch (error) {
                console.log(error);
                lastError = error;
                if (attempt === maxRetries) break;
                await new Promise(resolve => 
                    setTimeout(resolve, 1000 * Math.pow(2, attempt))
                );
            }
        }
        
        throw lastError;
    }

    async logEmailSent(notificationId, messageId, options) {
        await NotificationLog.create({
            NotificationID: notificationId,
            DeliveryType: 'EMAIL',
            Status: 'SENT',
            RecipientEmail: options.to,
            RecipientUserID: options.userId,
            MessageID: messageId,
            DeliveredAt: new Date(),
            MetaData: {
                template: options.template,
                subject: options.subject
            }
        });
    }

    async logEmailError(notificationId, error, options) {
        await NotificationLog.create({
            NotificationID: notificationId,
            DeliveryType: 'EMAIL',
            Status: 'FAILED',
            RecipientEmail: options.to,
            RecipientUserID: options.userId,
            ErrorDetails: error.message,
            MetaData: {
                template: options.template,
                error: error.stack
            }
        });
    }
}

module.exports = new EmailService();*/

// notifications/services/email.service.js

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { EMAIL_TEMPLATES } = require('../utils/notification.constants');
const NotificationLog = require('../models/notification-log.model');

class EmailService {
    constructor() {
        this.transporter = this.createTransporter();
        this.setupTemplateEngine();
    }

    createTransporter() {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        // Verify connection
        transporter.verify((error) => {
            if (error) {
                console.error('Email configuration error:', error);
            } else {
                console.log('Email service is ready');
            }
        });

        return transporter;
    }

    /*setupTemplateEngine() {
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path.resolve('./notifications/templates/emails/partials/'),
                layoutsDir: path.resolve('./notifications/templates/emails/layouts/'),
                defaultLayout: 'main.hbs',
                extName: '.hbs'
            },
            viewPath: path.resolve('./notifications/templates/emails/'),
            extName: '.hbs'
        };

        this.transporter.use('compile', hbs(handlebarOptions));
    }*/


        setupTemplateEngine() {
            const handlebarOptions = {
                viewEngine: {
                    partialsDir: path.resolve('./notifications/templates/emails/'),
                    defaultLayout: false  // Disable default layout
                },
                viewPath: path.resolve('./notifications/templates/emails/')
            };
        
            this.transporter.use('compile', hbs(handlebarOptions));
        }

    async sendEmail(options, notificationId = null) {
        try {
            if (!options.to || !options.template) {
                throw new Error('Missing required email options');
            }

            const template = EMAIL_TEMPLATES[options.template];
            if (!template) {
                throw new Error(`Template ${options.template} not found`);
            }

            const mailOptions = {
                from: `"Quarry Master" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: this.processSubject(template.subject, options.subjectData),
                template: template.name,
                context: {
                    ...options.data,
                    year: new Date().getFullYear()
                }
            };

            const info = await this.transporter.sendMail(mailOptions);

            if (notificationId) {
                await this.logEmailSuccess(notificationId, info.messageId, options);
            }

            return info;
        } catch (error) {
            console.error('Email sending failed:', error);
            if (notificationId) {
                await this.logEmailError(notificationId, error, options);
            }
            throw error;
        }
    }

    processSubject(subject, data = {}) {
        let processedSubject = subject;
        Object.keys(data).forEach(key => {
            const placeholder = `{${key}}`;
            if (subject.includes(placeholder)) {
                processedSubject = processedSubject.replace(placeholder, data[key]);
            }
        });
        return processedSubject;
    }

    async sendEmailWithRetry(options, notificationId = null, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.sendEmail({
                    ...options,
                    retryCount: attempt,
                    lastRetryAt: new Date()
                }, notificationId);
            } catch (error) {
                lastError = error;
                if (attempt === maxRetries) break;
                // Exponential backoff
                await new Promise(resolve => 
                    setTimeout(resolve, 1000 * Math.pow(2, attempt))
                );
            }
        }
        
        throw lastError;
    }

    async logEmailSuccess(notificationId, messageId, options) {
        await NotificationLog.create({
            NotificationID: notificationId,
            LogID: await this.generateLogId(),
            DeliveryType: 'EMAIL',
            Status: 'SENT',
            RecipientEmail: options.to,
            RecipientUserID: options.userId,
            MessageID: messageId,
            DeliveredAt: new Date(),
            MetaData: {
                template: options.template,
                retryCount: options.retryCount || 0
            }
        });
    }

    async logEmailError(notificationId, error, options) {
        await NotificationLog.create({
            LogID: await this.generateLogId(),
            NotificationID: notificationId,
            DeliveryType: 'EMAIL',
            Status: 'FAILED',
            RecipientEmail: options.to,
            RecipientUserID: options.userId,
            ErrorDetails: error.message,
            MetaData: {
                template: options.template,
                error: error.stack,
                retryCount: options.retryCount || 0,
                lastRetryAt: options.lastRetryAt
            }
        });
    }


     generateLogId = async () => {
        const lastLog = await NotificationLog.findOne({
            order: [['LogID', 'DESC']]
        });
    
        const nextNumber = lastLog 
            ? parseInt(lastLog.LogID.slice(3)) + 1 
            : 1;
    
        return `LOG${nextNumber.toString().padStart(5, '0')}`;
    };
}

module.exports = new EmailService();