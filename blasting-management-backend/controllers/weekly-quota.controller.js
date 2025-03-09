const weeklyQuotaService = require('../services/weekly-quota.service');
const { upload } = require('../utils/upload.util');
const FileUploadService = require('../services/fileUpload.service');

const validateQuotaData = async (data) => {
    const errors = [];

    if (!data.permitId) {
        errors.push('Permit ID is required');
    }

    if (!data.plannedUsageDate) {
        errors.push('Planned usage date is required');
    } else {
        const plannedDate = new Date(data.plannedUsageDate);
        const today = new Date();
        if (plannedDate < today) {
            errors.push('Planned usage date cannot be in the past');
        }
    }

    if (!data.purpose) {
        errors.push('Purpose is required');
    }

    if (!data.blastingLocation) {
        errors.push('Blasting location is required');
    }

    if (!data.blastingTime) {
        errors.push('Blasting time is required');
    }

    if (!data.safetyMeasures) {
        errors.push('Safety measures are required');
    }

    return errors;
};

const validateStatusTransition = async (quotaId, newStatus, userRole) => {
    const quota = await weeklyQuotaService.getQuotaDetails(quotaId);
    if (!quota) return 'Quota not found';

    const allowedTransitions = {
        'Pending': ['Approved', 'Rejected', 'Cancelled'],
        'Approved': ['Used', 'Expired', 'Cancelled'],
        'Rejected': [],
        'Used': [],
        'Expired': [],
        'Cancelled': []
    };

    if (!allowedTransitions[quota.Status].includes(newStatus)) {
        return `Cannot transition from ${quota.Status} to ${newStatus}`;
    }

    const rolePermissions = {
        'ROLE_ADMIN': ['Approved', 'Rejected', 'Cancelled', 'Expired'],
        'ROLE_EXPLOSIVE_CONTROLLER': ['Approved', 'Rejected'],
        'ROLE_SITE_ENGINEER': ['Cancelled']
    };

    if (!rolePermissions[userRole]?.includes(newStatus)) {
        return 'Unauthorized to perform this status change';
    }

    return null;
};

exports.createQuotaRequest = async (req, res) => {
    try {
        const validationErrors = await validateQuotaData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const quota = await weeklyQuotaService.createQuotaRequest(
            {
                permitId: req.body.permitId,
                plannedUsageDate: req.body.plannedUsageDate,
                purpose: req.body.purpose,
                blastingLocation: req.body.blastingLocation,
                blastingTime: req.body.blastingTime,
                safetyMeasures: req.body.safetyMeasures,
                validityPeriod: req.body.validityPeriod
            },
            req.userId
        );

        res.status(201).json({
            status: 'success',
            message: 'Quota request created successfully',
            data: quota
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating quota request'
        });
    }
};

exports.updateQuotaStatus = async (req, res) => {
    let quotaSealPhotoURL = null;

    try {
        const items = req.body.items ? JSON.parse(req.body.items) : [];
        const { status, reason } = req.body;

        const validationError = await validateStatusTransition(
            req.params.quotaId,
            status,
            req.userRole
        );
        
        if (validationError) {
            return res.status(400).json({
                status: 'error',
                message: validationError
            });
        }

        /*let quotaSealPhotoURL = null;
        if (req.files && req.files.quotaSeal) {
            quotaSealPhotoURL = await upload(
                req.files.quotaSeal,
                'quota-seals',
                req.params.quotaId
            );
        }*/
    
            if (req.file) {  // Changed from req.files to req.file since using multer.single()
                quotaSealPhotoURL = await FileUploadService.saveFile(
                    req.file,
                    'quota-seals',
                    req.params.quotaId
                );
            }
            console.log(items);

        const quota = await weeklyQuotaService.updateQuotaStatus(
            req.params.quotaId,
            status,
            {
                reason,
                items,
                quotaSealPhotoURL
            },
            req.referenceId,
            req.userId

        );

        res.json({
            status: 'success',
            message: `Quota ${status.toLowerCase()} successfully`,
            data: quota
        });
    } catch (error) {

         // If there's an error, clean up any uploaded file
         if (req.file) {
            await FileUploadService.deleteFile(quotaSealPhotoURL);
        }


        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating quota status'
        });
    }
};

exports.validateQuotaRequest = async (req, res) => {
    try {
        // Log incoming request
        console.log('Validating quota request:', req.body);

        const validationData = {
            permitId: req.body.permitId,
            plannedUsageDate: req.body.plannedUsageDate,
            purpose: req.body.purpose,
            blastingLocation: req.body.blastingLocation,
            blastingTime: req.body.blastingTime,
            safetyMeasures: req.body.safetyMeasures,
            validityPeriod: req.body.validityPeriod || 7
        };

        const errors = await weeklyQuotaService.validateQuotaData(validationData);
        
        // Log validation result
        console.log('Validation complete:', {
            isValid: errors.length === 0,
            errors
        });

        res.json({
            status: 'success',
            data: {
                isValid: errors.length === 0,
                errors
            }
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error validating quota request'
        });
    }
};

exports.recordQuotaUsage = async (req, res) => {
    try {
        const usage = await weeklyQuotaService.recordQuotaUsage(
            req.params.quotaId,
            {
                blastingReport: req.body.blastingReport,
                safetyChecklist: req.body.safetyChecklist,
                weatherConditions: req.body.weatherConditions,
                supervisorName: req.body.supervisorName,
                status: req.body.status,
                items: req.body.items
            },
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Usage recorded successfully',
            data: usage
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error recording usage'
        });
    }
};

exports.getQuotaDetails = async (req, res) => {
    try {
        const quota = await weeklyQuotaService.getQuotaDetails(req.params.quotaId);
        
        if (!quota) {
            return res.status(404).json({
                status: 'error',
                message: 'Quota not found'
            });
        }

        res.json({
            status: 'success',
            data: quota
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving quota details'
        });
    }
};

exports.getPermitQuotas = async (req, res) => {
    try {
        const quotas = await weeklyQuotaService.getPermitQuotas(
            req.params.permitId,
            {
                status: req.query.status,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            }
        );

        res.json({
            status: 'success',
            data: quotas
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving permit quotas'
        });
    }
};

exports.getPendingQuotas = async (req, res) => {
    try {
        console.log('Reference ID (Controller ID):', req.referenceId);
        console.log('Reference Type:', req.referenceType);
        const quotas = await weeklyQuotaService.getPendingQuotas(req.referenceId);

        res.json({
            status: 'success',
            data: quotas
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving pending quotas'
        });
    }
};

exports.getQuotaUsageHistory = async (req, res) => {
    try {
        const history = await weeklyQuotaService.getQuotaUsageHistory(
            req.params.quotaId
        );

        res.json({
            status: 'success',
            data: history
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving usage history'
        });
    }
};

exports.cancelQuota = async (req, res) => {
    try {
        const quota = await weeklyQuotaService.cancelQuota(
            req.params.quotaId,
            req.body.reason,
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Quota cancelled successfully',
            data: quota
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error cancelling quota'
        });
    }
};

exports.generateQuotaSummary = async (req, res) => {
    try {
        const summary = await weeklyQuotaService.generateQuotaSummary(
            req.params.permitId,
            req.query.startDate,
            req.query.endDate
        );

        res.json({
            status: 'success',
            data: summary
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error generating summary'
        });
    }
};