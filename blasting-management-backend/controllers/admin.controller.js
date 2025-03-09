// controllers/admin.controller.js
const adminService = require('../services/admin.service');
const { ResponseUtil, formatResponse } = require('../utils/response');


exports.createUser = async (req, res) => {
    try {
        const {
            userType,
            userData,
            roleData
        } = req.body;

        // Basic validation
        if (!userType || !userData || !roleData) {
            return ResponseUtil.badRequestResponse(res, 'Missing required fields');
        }

        // Role-specific validation
        const validationErrors = [];
        
        // Common validations
        if (!roleData.name) validationErrors.push('Name is required');
        if (!roleData.nic) validationErrors.push('NIC is required');
        if (!roleData.address) validationErrors.push('Address is required');
        if (!roleData.contactNumber) validationErrors.push('Contact number is required');
        if (!roleData.email) validationErrors.push('Email is required');

        // Type-specific validations
        switch (userType) {
            case 'SITE_ENGINEER':
                if (!roleData.miningSiteId) validationErrors.push('Mining site ID is required');
                break;

            case 'EXPLOSIVE_CONTROLLER':
            case 'EXPLOSIVE_DEALER':
                if (!roleData.district) validationErrors.push('District is required');
                if (userType === 'EXPLOSIVE_DEALER' && !roleData.licenseNumber) {
                    validationErrors.push('License number is required');
                }
                break;

            default:
                return ResponseUtil.badRequestResponse(res, 'Invalid user type');
        }

        if (validationErrors.length > 0) {
            return ResponseUtil.badRequestResponse(res, 'Validation failed', validationErrors);
        }

        const result = await adminService.createUser(userType, userData, roleData,req.userId);

        return formatResponse(
            res,
            201,
            'User created successfully. Credentials sent via email.',
            result
        );

    } catch (err) {
        console.error('User creation error:', err);
        return ResponseUtil.errorResponse(
            res,
            err.status || 500,
            err.message || 'Failed to create user',
            err
        );
    }
};

