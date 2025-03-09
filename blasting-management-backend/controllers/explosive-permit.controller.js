// explosive-permit.controller.js

const explosivePermitService = require('../services/explosive-permit.service');
const { ROLES } = require('../middleware/role.middleware');

/* class ExplosivePermitController {
    /**
     * Create new permit
     * @route POST /api/permits
     
    async createPermit(req, res) {
        try {
            // Validate input data
            const validationErrors = await this.validatePermitData(req.body);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            const permit = await explosivePermitService.createPermit(
                {
                    miningSiteId: req.body.miningSiteId,
                    licenseId: req.body.licenseId,
                    controllerId: req.body.controllerId,
                    purpose: req.body.purpose,
                    validityPeriod: req.body.validityPeriod,
                    remarks: req.body.remarks,
                    explosives: req.body.explosives // Array of explosive types and quantities
                },
                req.userId
            );

            // Handle permit photo upload if exists
            if (req.files && req.files.permitPhoto) {
                const photoUrl = await this.handlePermitPhotoUpload(req.files.permitPhoto, permit.PermitID);
                await explosivePermitService.updatePermitPhoto(permit.PermitID, photoUrl);
                permit.PermitPhotoURL = photoUrl;
            }

            res.status(201).json({
                status: 'success',
                message: 'Permit created successfully',
                data: permit
            });
        } catch (error) {
            console.log(error);
            console.log(req.userId);
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error creating permit'
            });
        }
    }

    /**
     * Update permit status
     * @route PATCH /api/permits/:permitId/status
     
    async updatePermitStatus(req, res) {
        try {
            const { status, remarks } = req.body;

            // Validate status transition
            const validationError = await this.validateStatusTransition(
                req.params.permitId,
                status,
                req.userRole
            );
            
            if (validationError) {
                return res.status(400).json({
                    status: 'error',
                    message: validationError
                });
            }

            const permit = await explosivePermitService.updatePermitStatus(
                req.params.permitId,
                status,
                remarks,
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Permit status updated successfully',
                data: permit
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating permit status'
            });
        }
    }

    /**
     * Update permit quantities
     * @route PUT /api/permits/:permitId/quantities
     
    async updateRemainingQuantities(req, res) {
        try {
            const { quotaId, usageData } = req.body;

            const permit = await explosivePermitService.updateRemainingQuantities(
                req.params.permitId,
                quotaId,
                usageData,
                req.userId
            );

            res.json({
                status: 'success',
                message: 'Quantities updated successfully',
                data: permit
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error updating quantities'
            });
        }
    }

    /**
     * Get permit details
     * @route GET /api/permits/:permitId
     
    async getPermitDetails(req, res) {
        try {
            const permit = await explosivePermitService.getPermitDetails(req.params.permitId);
            
            if (!permit) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Permit not found'
                });
            }

            res.json({
                status: 'success',
                data: permit
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving permit details'
            });
        }
    }

    /**
     * Get mining site permits
     * @route GET /api/permits/site/:miningSiteId
     
    async getMiningSitePermits(req, res) {
        try {
            const permits = await explosivePermitService.getMiningSitePermits(
                req.params.miningSiteId,
                req.query.status
            );

            res.json({
                status: 'success',
                data: permits
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving permits'
            });
        }
    }

    /**
     * Get permit usage history
     * @route GET /api/permits/:permitId/usage
     
    async getPermitUsageHistory(req, res) {
        try {
            const usage = await explosivePermitService.getPermitUsageHistory(req.params.permitId);

            res.json({
                status: 'success',
                data: usage
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error retrieving usage history'
            });
        }
    }

    /**
     * Get expiring permits
     * @route GET /api/permits/expiring
     
    async getExpiringPermits(req, res) {
        try {
            const permits = await explosivePermitService.checkExpiringPermits();

            res.json({
                status: 'success',
                data: permits
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error checking expiring permits'
            });
        }
    }

    /**
     * Generate permit report
     * @route GET /api/permits/:permitId/report
     
    async generatePermitReport(req, res) {
        try {
            const report = await explosivePermitService.generatePermitReport(
                req.params.permitId,
                req.query.format || 'pdf'
            );

            res.json({
                status: 'success',
                data: report
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message || 'Error generating report'
            });
        }
    }

    /**
     * Validate permit data
     * @private
     
    async validatePermitData(data) {
        const errors = [];

        if (!data.miningSiteId) {
            errors.push('Mining site is required');
        }

        if (!data.licenseId) {
            errors.push('License is required');
        }

        if (!data.controllerId) {
            errors.push('Controller is required');
        }

        if (!data.purpose) {
            errors.push('Purpose is required');
        }

        if (!Array.isArray(data.explosives) || data.explosives.length === 0) {
            errors.push('At least one explosive type is required');
        } else {
            for (const explosive of data.explosives) {
                if (!explosive.typeId || !explosive.quantity || !explosive.unit) {
                    errors.push('Invalid explosive data provided');
                    break;
                }
                if (explosive.quantity <= 0) {
                    errors.push('Quantity must be greater than zero');
                    break;
                }
            }
        }

        if (data.validityPeriod) {
            if (data.validityPeriod < 1 || data.validityPeriod > 365) {
                errors.push('Validity period must be between 1 and 365 days');
            }
        }

        return errors;
    }

    /**
     * Validate status transition
     * @private
     
    async validateStatusTransition(permitId, newStatus, userRole) {
        const permit = await explosivePermitService.getPermitDetails(permitId);
        if (!permit) return 'Permit not found';

        const allowedTransitions = {
            'Pending': ['Active', 'Rejected'],
            'Active': ['Suspended', 'Expired'],
            'Suspended': ['Active', 'Expired'],
            'Rejected': [],
            'Expired': []
        };

        // Check if status transition is allowed
        if (!allowedTransitions[permit.Status].includes(newStatus)) {
            return `Cannot transition from ${permit.Status} to ${newStatus}`;
        }

        // Check role permissions
        const rolePermissions = {
            'ROLE_ADMIN': ['Active', 'Suspended', 'Expired'],
            'ROLE_EXPLOSIVE_CONTROLLER': ['Active', 'Rejected'],
            'ROLE_SITE_ENGINEER': []
        };

        if (!rolePermissions[userRole]?.includes(newStatus)) {
            return 'Unauthorized to perform this status change';
        }

        return null;
    }

    /**
     * Handle permit photo upload
     * @private
     
    async handlePermitPhotoUpload(file, permitId) {
        try {
            const fileName = `permit_${permitId}_${Date.now()}${path.extname(file.name)}`;
            const filePath = path.join(__dirname, '../uploads/permits', fileName);

            await file.mv(filePath);
            return `/uploads/permits/${fileName}`;
        } catch (error) {
            console.error('File upload error:', error);
            throw { status: 500, message: 'Error uploading permit photo' };
        }
    }
}

module.exports = new ExplosivePermitController(); */

// Private helper functions
const validatePermitData = async (data) => {
    const errors = [];
    console.log(data);
    // Parse 'explosives' field if it's a stringified JSON
    const explosives = data.explosives ? JSON.parse(data.explosives) : [];

    if (!data.miningSiteId) {
        
        errors.push('Mining site is required');
    }

    if (!data.licenseId) {
        errors.push('License is required');
    }

    if (!data.controllerId) {
        errors.push('Controller is required');
    }

    if (!data.purpose) {
        errors.push('Purpose is required');
    }

    if (!Array.isArray(explosives) || explosives.length === 0) {
        errors.push('At least one explosive type is required');
    } else {
        for (const explosive of explosives) {
            if (!explosive.explosiveTypeId || !explosive.quantity || !explosive.unit) {
                console.log(explosive)
                errors.push('Invalid explosive data provided');
                break;
            }
            if (explosive.quantity <= 0) {
                errors.push('Quantity must be greater than zero');
                break;
            }
        }
    }

    if (data.validityPeriod) {
        if (data.validityPeriod < 1 || data.validityPeriod > 365) {
            errors.push('Validity period must be between 1 and 365 days');
        }
    }

    return errors;
};

const validateStatusTransition = async (permitId, newStatus, userRole) => {
    const permit = await explosivePermitService.getPermitDetails(permitId);
    if (!permit) return 'Permit not found';

    const allowedTransitions = {
        'Pending': ['Active', 'Rejected'],
        'Active': ['Suspended', 'Expired'],
        'Suspended': ['Active', 'Expired'],
        'Rejected': [],
        'Expired': []
    };

    if (!allowedTransitions[permit.Status].includes(newStatus)) {
        return `Cannot transition from ${permit.Status} to ${newStatus}`;
    }

    const rolePermissions = {
        'ROLE_ADMIN': ['Active', 'Suspended', 'Expired'],
        'ROLE_EXPLOSIVE_CONTROLLER': ['Active', 'Rejected'],
        'ROLE_SITE_ENGINEER': []
    };

    if (!rolePermissions[userRole]?.includes(newStatus)) {
        return 'Unauthorized to perform this status change';
    }

    return null;
};

const handlePermitPhotoUpload = async (file, permitId) => {
    try {
        const fileName = `permit_${permitId}_${Date.now()}${path.extname(file.name)}`;
        const filePath = path.join(__dirname, '../uploads/permits', fileName);

        await file.mv(filePath);
        return `/uploads/permits/${fileName}`;
    } catch (error) {
        console.error('File upload error:', error);
        throw { status: 500, message: 'Error uploading permit photo' };
    }
};

// Exported controller functions
/*exports.createPermit = async (req, res) => {
    try {
        
        const validationErrors = await validatePermitData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Parse 'explosives' field if it's a stringified JSON
        const explosives = req.body.explosives ? JSON.parse(req.body.explosives) : [];

        const permit = await explosivePermitService.createPermit(
            {
                miningSiteId: req.body.miningSiteId,
                licenseId: req.body.licenseId,
                controllerId: req.body.controllerId,
                purpose: req.body.purpose,
                validityPeriod: req.body.validityPeriod,
                remarks: req.body.remarks,
                explosives : explosives
            },
            req.userId
        );

        /*if (req.files && req.files.permitPhoto) {
            const photoUrl = await handlePermitPhotoUpload(req.files.permitPhoto, permit.PermitID);
            await explosivePermitService.updatePermitPhoto(permit.PermitID, photoUrl);
            permit.PermitPhotoURL = photoUrl;
        }*/
/*
            if (req.file) {
                const photoUrl = `/uploads/permits/${req.file.filename}`;
                await explosivePermitService.updatePermitPhoto(permit.PermitID, photoUrl);
                permit.PermitPhotoURL = photoUrl;
            }

        res.status(201).json({
            status: 'success',
            message: 'Permit created successfully',
            data: permit
        });
    } catch (error) {
        console.log(error);
        console.log(req.userId);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating permit'
        });
    }
};




exports.updatePermitStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        const validationError = await validateStatusTransition(
            req.params.permitId,
            status,
            req.userRole
        );
        
        if (validationError) {
            return res.status(400).json({
                status: 'error',
                message: validationError
            });
        }

        const permit = await explosivePermitService.updatePermitStatus(
            req.params.permitId,
            status,
            remarks,
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Permit status updated successfully',
            data: permit
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating permit status'
        });
    }
};*/



exports.createPermit = async (req, res) => {
    try {
        const validationErrors = await validatePermitData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Parse 'explosives' field if it's a stringified JSON
        const explosives = req.body.explosives ? JSON.parse(req.body.explosives) : [];

        const permit = await explosivePermitService.createPermit(
            {
                miningSiteId: req.body.miningSiteId,
                licenseId: req.body.licenseId,
                controllerId: req.body.controllerId,
                purpose: req.body.purpose,
                validityPeriod: req.body.validityPeriod,
                remarks: req.body.remarks,
                explosives: explosives
            },
            req.userId
        );

        res.status(201).json({
            status: 'success',
            message: 'Permit request created successfully',
            data: permit
        });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating permit request'
        });
    }
};

exports.updatePermitStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;

        // Additional validation for photo when approving
        if (status === 'Active' && !req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'Permit photo is required for approval'
            });
        }

        const validationError = await validateStatusTransition(
            req.params.permitId,
            status,
            req.userRole
        );
        
        if (validationError) {
            return res.status(400).json({
                status: 'error',
                message: validationError
            });
        }

        // Handle photo upload for approval
        let photoUrl = null;
        if (req.file) {
            photoUrl = `/uploads/permits/${req.file.filename}`;
        }

        const permit = await explosivePermitService.updatePermitStatus(
            req.params.permitId,
            status,
            remarks,
            photoUrl,  // Pass the photo URL to the service
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Permit status updated successfully',
            data: permit
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating permit status'
        });
    }
};

exports.updateRemainingQuantities = async (req, res) => {
    try {
        const { quotaId, usageData } = req.body;

        const permit = await explosivePermitService.updateRemainingQuantities(
            req.params.permitId,
            quotaId,
            usageData,
            req.userId
        );

        res.json({
            status: 'success',
            message: 'Quantities updated successfully',
            data: permit
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating quantities'
        });
    }
};

exports.getPermitDetails = async (req, res) => {
    try {
        const permit = await explosivePermitService.getPermitDetails(req.params.permitId);
        
        if (!permit) {
            return res.status(404).json({
                status: 'error',
                message: 'Permit not found'
            });
        }

        res.json({
            status: 'success',
            data: permit
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving permit details'
        });
    }
};


/*exports.getControllerPermits = async (req, res) => {
    try {
        // Verify if controller is requesting their own permits
        if (req.userRole === ROLES.EXPLOSIVE_CONTROLLER && 
            req.referenceId !== req.params.controllerId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized access to these permits'
            });
        }

        const permits = await explosivePermitService.getControllerPermits(
            req.params.controllerId,
            req.query.status
        );

        res.json({
            status: 'success',
            data: permits
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving controller permits'
        });
    }
};*/

// explosive-permit.controller.js

exports.getControllerPermits = async (req, res) => {
    try {
        if (req.userRole === ROLES.EXPLOSIVE_CONTROLLER && 
            req.referenceId !== req.params.controllerId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized access'
            });
        }

        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await explosivePermitService.getControllerPermits(
            req.params.controllerId,
            req.query.status,
            pagination
        );

        res.json({
            status: 'success',
            data: {
                permits: result.permits,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: pagination.page
            }
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving permits'
        });
    }
};




exports.getMiningSitePermits = async (req, res) => {
    try {
        const permits = await explosivePermitService.getMiningSitePermits(
            req.params.miningSiteId,
            req.query.status
        );

        res.json({
            status: 'success',
            data: permits
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving permits'
        });
    }
};

exports.getPermitUsageHistory = async (req, res) => {
    try {
        const usage = await explosivePermitService.getPermitUsageHistory(req.params.permitId);

        res.json({
            status: 'success',
            data: usage
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving usage history'
        });
    }
};

exports.getExpiringPermits = async (req, res) => {
    try {
        const permits = await explosivePermitService.checkExpiringPermits();

        res.json({
            status: 'success',
            data: permits
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error checking expiring permits'
        });
    }
};

exports.generatePermitReport = async (req, res) => {
    try {
        const report = await explosivePermitService.generatePermitReport(
            req.params.permitId,
            req.query.format || 'pdf'
        );

        res.json({
            status: 'success',
            data: report
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error generating report'
        });
    }
};