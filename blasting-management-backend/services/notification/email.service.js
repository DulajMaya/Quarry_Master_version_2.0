// services/notification/email.service.js
/*
const { transporter, EMAIL_TYPES } = require('../../config/email.config');
const { NotificationLog, NotificationTemplate } = require('../../models');
const { generateLogId } = require('../id-generator.service');

class EmailService {
    /**
     * Send email using template
     
    async sendTemplatedEmail(options) {
        try {
            const {
                to,
                templateId,
                context,
                userId,
                notificationId,
                attachments
            } = options;

            // Get template
            const template = await NotificationTemplate.findByPk(templateId);
            if (!template) {
                throw new Error('Email template not found');
            }

            // Validate template variables
            template.validateVariables(context);

            // Create log entry
            const logId = await generateLogId();
            const log = await NotificationLog.create({
                LogID: logId,
                NotificationID: notificationId,
                TemplateID: templateId,
                DeliveryType: 'EMAIL',
                Status: 'PENDING',
                RecipientEmail: to,
                RecipientUserID: userId
            });

            // Send email
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: to,
                subject: template.Subject,
                template: template.Name,
                context: {
                    ...context,
                    year: new Date().getFullYear()
                },
                attachments: attachments || []
            };

            const info = await transporter.sendMail(mailOptions);

            // Update log with success
            await log.update({
                Status: 'SENT',
                MessageID: info.messageId,
                DeliveredAt: new Date()
            });

            return {
                success: true,
                messageId: info.messageId,
                logId: logId
            };

        } catch (error) {
            console.error('Email sending failed:', error);

            // Log error if log exists
            if (log) {
                await log.update({
                    Status: 'FAILED',
                    SendAttempts: log.SendAttempts + 1,
                    LastAttemptAt: new Date(),
                    ErrorDetails: error.message
                });
            }

            throw error;
        }
    }

    /**
     * Send multiple emails with rate limiting
     
    async sendBulkEmails(emailsList, rateLimit = 50) {
        const results = [];
        
        for (let i = 0; i < emailsList.length; i += rateLimit) {
            const batch = emailsList.slice(i, i + rateLimit);
            const promises = batch.map(email => this.sendTemplatedEmail(email)
                .catch(error => ({
                    success: false,
                    error: error.message,
                    recipient: email.to
                }))
            );
            
            const batchResults = await Promise.all(promises);
            results.push(...batchResults);

            // Rate limiting delay
            if (i + rateLimit < emailsList.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return {
            total: emailsList.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            results: results
        };
    }

    /**
     * Retry failed emails
     
    async retryFailedEmails(maxRetries = 3) {
        const failedLogs = await NotificationLog.findAll({
            where: {
                Status: 'FAILED',
                SendAttempts: {
                    [Op.lt]: maxRetries
                }
            },
            include: [{ model: NotificationTemplate }]
        });

        const retryResults = await Promise.all(
            failedLogs.map(async log => {
                try {
                    await this.sendTemplatedEmail({
                        to: log.RecipientEmail,
                        templateId: log.TemplateID,
                        context: log.MetaData.context,
                        userId: log.RecipientUserID,
                        notificationId: log.NotificationID
                    });
                    return { success: true, logId: log.LogID };
                } catch (error) {
                    return { success: false, logId: log.LogID, error: error.message };
                }
            })
        );

        return {
            total: failedLogs.length,
            successful: retryResults.filter(r => r.success).length,
            failed: retryResults.filter(r => !r.success).length,
            results: retryResults
        };
    }

    /**
     * Get email delivery status
     
    async getEmailStatus(logId) {
        const log = await NotificationLog.findByPk(logId, {
            include: [{ model: NotificationTemplate }]
        });

        if (!log) {
            throw new Error('Email log not found');
        }

        return {
            status: log.Status,
            recipient: log.RecipientEmail,
            sentAt: log.DeliveredAt,
            attempts: log.SendAttempts,
            template: log.NotificationTemplate.Name
        };
    }
}

module.exports = new EmailService();*/