// services/notification/template.service.js
/*
const { NotificationTemplate, NotificationLog } = require('../../models');
const { generateTemplateId } = require('../id-generator.service');
const { Op } = require('sequelize');
const Handlebars = require('handlebars');

class TemplateService {
    /**
     * Create notification template
     
    async createTemplate(data, userId) {
        try {
            const templateId = await generateTemplateId();

            // Validate template syntax
            this.validateTemplate(data.content);

            // Extract variables from template
            const variables = this.extractTemplateVariables(data.content);

            const template = await NotificationTemplate.create({
                TemplateID: templateId,
                Name: data.name,
                Type: data.type,
                Subject: data.subject,
                Content: data.content,
                Variables: variables,
                Category: data.category,
                Description: data.description,
                LastUpdatedBy: userId
            });

            return template;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update notification template
     
    async updateTemplate(templateId, data, userId) {
        try {
            const template = await NotificationTemplate.findByPk(templateId);
            
            if (!template) {
                throw new Error('Template not found');
            }

            if (data.content) {
                // Validate new template syntax
                this.validateTemplate(data.content);
                // Extract new variables
                data.Variables = this.extractTemplateVariables(data.content);
            }

            await template.update({
                ...data,
                LastUpdatedBy: userId
            });

            return template;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get template details with usage statistics
     
    async getTemplateDetails(templateId) {
        const template = await NotificationTemplate.findByPk(templateId);
        
        if (!template) {
            throw new Error('Template not found');
        }

        // Get usage statistics
        const stats = await NotificationLog.findAll({
            where: { TemplateID: templateId },
            attributes: [
                'Status',
                [sequelize.fn('COUNT', sequelize.col('LogID')), 'count']
            ],
            group: ['Status']
        });

        return {
            ...template.toJSON(),
            usage: {
                stats: stats.reduce((acc, stat) => {
                    acc[stat.Status] = stat.get('count');
                    return acc;
                }, {}),
                lastUsed: await this.getLastUsed(templateId)
            }
        };
    }

    /**
     * Get templates by category
     
    async getTemplatesByCategory(category, options = {}) {
        const { status, page = 1, limit = 10 } = options;

        const whereClause = { Category: category };
        if (status) {
            whereClause.Status = status;
        }

        const templates = await NotificationTemplate.findAndCountAll({
            where: whereClause,
            order: [['CreatedAt', 'DESC']],
            limit,
            offset: (page - 1) * limit
        });

        return {
            templates: templates.rows,
            total: templates.count,
            page,
            totalPages: Math.ceil(templates.count / limit)
        };
    }

    /**
     * Validate template syntax
     
    validateTemplate(content) {
        try {
            Handlebars.compile(content);
            return true;
        } catch (error) {
            throw new Error(`Template syntax error: ${error.message}`);
        }
    }

    /**
     * Extract variables from template
     
    extractTemplateVariables(content) {
        const regex = /{{([^}]+)}}/g;
        const variables = new Set();
        let match;

        while ((match = regex.exec(content)) !== null) {
            // Remove any helpers or modifiers and just get the variable name
            const variable = match[1].trim().split(' ')[0];
            if (!variable.startsWith('#') && !variable.startsWith('/')) {
                variables.add(variable);
            }
        }

        return Array.from(variables);
    }

    /**
     * Get template preview
     
    async getTemplatePreview(templateId, context) {
        const template = await NotificationTemplate.findByPk(templateId);
        
        if (!template) {
            throw new Error('Template not found');
        }

        try {
            // Validate required variables
            template.validateVariables(context);

            // Compile template
            const compiledTemplate = Handlebars.compile(template.Content);
            const preview = compiledTemplate(context);

            return {
                subject: template.Subject,
                content: preview
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Clone template
     
    async cloneTemplate(templateId, newName, userId) {
        const template = await NotificationTemplate.findByPk(templateId);
        
        if (!template) {
            throw new Error('Template not found');
        }

        const newTemplateId = await generateTemplateId();
        const clonedTemplate = await NotificationTemplate.create({
            TemplateID: newTemplateId,
            Name: newName,
            Type: template.Type,
            Subject: template.Subject,
            Content: template.Content,
            Variables: template.Variables,
            Category: template.Category,
            Description: `Cloned from ${template.Name}`,
            LastUpdatedBy: userId
        });

        return clonedTemplate;
    }

    /**
     * Get last used date
     
    async getLastUsed(templateId) {
        const lastLog = await NotificationLog.findOne({
            where: { 
                TemplateID: templateId,
                Status: 'SENT'
            },
            order: [['CreatedAt', 'DESC']]
        });

        return lastLog ? lastLog.CreatedAt : null;
    }

    /**
     * Get template performance metrics
     
    async getTemplateMetrics(templateId, startDate, endDate) {
        const logs = await NotificationLog.findAll({
            where: {
                TemplateID: templateId,
                CreatedAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'Status',
                [sequelize.fn('COUNT', sequelize.col('LogID')), 'count'],
                [sequelize.fn('AVG', 
                    sequelize.fn('TIMESTAMPDIFF', 
                        sequelize.literal('SECOND'), 
                        sequelize.col('CreatedAt'), 
                        sequelize.col('DeliveredAt')
                    )
                ), 'avgDeliveryTime']
            ],
            group: ['Status']
        });

        return {
            total: logs.reduce((sum, log) => sum + parseInt(log.get('count')), 0),
            stats: logs.reduce((acc, log) => {
                acc[log.Status] = {
                    count: parseInt(log.get('count')),
                    percentage: 0
                };
                return acc;
            }, {}),
            averageDeliveryTime: logs.find(log => log.Status === 'SENT')?.get('avgDeliveryTime') || 0
        };
    }
}

module.exports = new TemplateService();*/