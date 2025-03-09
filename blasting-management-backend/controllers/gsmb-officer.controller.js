// controllers/gsmb-officer.controller.js
const gsmbOfficerService = require('../services/gsmb-officer.service');
const { validateCreateGSMBOfficer,
    validateUpdateGSMBOfficer,
    validateBulkGSMBOfficers,
    validateOfficerDeactivation,
    isValidPhoneNumber,
    isValidEmail,
    isValidName } = require('../utils/validateinput-gsmbofficer');
const { formatResponse, errorResponse } = require('../utils/response');

class GSMBOfficerController {
    async createOfficer(req, res) {
        try {
            const validationRules = {
                name: { type: 'string', required: true },
                telephone_number: { type: 'string', required: true },
                email_address: { type: 'email', required: true }
            };

            const validatedData = validateCreateGSMBOfficer(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const officer = await gsmbOfficerService.createOfficer(req.body);
            return formatResponse(res, 201, 'GSMB officer created successfully', officer);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async updateOfficer(req, res) {
        try {
            const { officerId } = req.params;
            const validationRules = {
                name: { type: 'string', required: false },
                telephone_number: { type: 'string', required: false },
                email_address: { type: 'email', required: false }
            };

            const validatedData = validateUpdateGSMBOfficer(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const officer = await gsmbOfficerService.updateOfficer(officerId, req.body);
            return formatResponse(res, 200, 'GSMB officer updated successfully', officer);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getOfficerById(req, res) {
        try {
            const { officerId } = req.params;
            const officer = await gsmbOfficerService.getOfficerById(officerId);
            return formatResponse(res, 200, 'GSMB officer retrieved successfully', officer);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getAllActiveOfficers(req, res) {
        try {
            const officers = await gsmbOfficerService.getAllActiveOfficers();
            return formatResponse(res, 200, 'Active GSMB officers retrieved successfully', officers);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getOfficerTestBlasts(req, res) {
        try {
            const { officerId } = req.params;
            const testBlasts = await gsmbOfficerService.getOfficerTestBlasts(officerId);
            return formatResponse(res, 200, 'Officer test blasts retrieved successfully', testBlasts);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async deactivateOfficer(req, res) {
        try {
            const { officerId } = req.params;
            const officer = await gsmbOfficerService.deactivateOfficer(officerId);
            return formatResponse(res, 200, 'GSMB officer deactivated successfully', officer);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async searchOfficers(req, res) {
        try {
            const { searchTerm } = req.query;
            const officers = await gsmbOfficerService.searchOfficers(searchTerm);
            return formatResponse(res, 200, 'GSMB officers search results', officers);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new GSMBOfficerController();