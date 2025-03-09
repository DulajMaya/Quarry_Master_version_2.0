// notifications/services/template.service.js

const Handlebars = require('handlebars');
const NotificationTemplate = require('../models/notification-template.model');
const config = require('../config/notification.config');

class TemplateService {
    constructor() {
        this.registerHelpers();
    }

    registerHelpers() {
        // Date formatting helper
        Handlebars.registerHelper('formatDate', (date) => {
            return new Date(date).toLocaleDateString();
        });

        // Currency formatting helper
        Handlebars.registerHelper('formatCurrency', (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        });
    }

    async validateTemplate(content) {
        try {
            Handlebars.compile(content);
            return true;
        } catch (error) {
            throw new Error(`Template validation error: ${error.message}`);
        }
    }

    async compileTemplate(templateName, data) {
        try {
            const template = await NotificationTemplate.findOne({
                where: { Name: templateName }
            });

            if (!template) {
                throw new Error(`Template not found: ${templateName}`);
            }

            await this.validateTemplate(template.Content);
            
            // Extract and validate required variables
            const requiredVariables = this.extractTemplateVariables(template.Content);
            this.validateTemplateData(requiredVariables, data);

            // Compile the template
            const compiledTemplate = Handlebars.compile(template.Content);
            return compiledTemplate(data);
        } catch (error) {
            throw new Error(`Template compilation error: ${error.message}`);
        }
    }

    extractTemplateVariables(content) {
        const regex = /{{([^}]+)}}/g;
        const variables = new Set();
        let match;

        while ((match = regex.exec(content)) !== null) {
            const variable = match[1].trim().split(' ')[0];
            if (!variable.startsWith('#') && !variable.startsWith('/')) {
                variables.add(variable);
            }
        }

        return Array.from(variables);
    }

    validateTemplateData(requiredVariables, data) {
        const missingVariables = requiredVariables.filter(variable => 
            !data.hasOwnProperty(variable)
        );

        if (missingVariables.length > 0) {
            throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
        }
    }

    async getTemplatePreview(templateName, data) {
        const compiledContent = await this.compileTemplate(templateName, data);
        return {
            content: compiledContent,
            variables: this.extractTemplateVariables(compiledContent)
        };
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
}

module.exports = new TemplateService();