// role.middleware.js
const { User, Role } = require('../models');

const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SITE_ENGINEER: 'ROLE_SITE_ENGINEER',
    EXPLOSIVE_CONTROLLER: 'ROLE_EXPLOSIVE_CONTROLLER',
    EXPLOSIVE_DEALER: 'ROLE_EXPLOSIVE_DEALER'
};

// Check if user has required role
const hasRole = (roles) => async (req, res, next) => {
    try {
        console.log('Starting hasRole middleware');  // Add this
        console.log('User ID from request:', req.userId);  // Add this
        console.log('Roles to check:', roles); 
        if (!req.userId) {
            return res.status(403).json({ 
                status: 'error',
                message: 'No user ID provided' 
            });
        }

        const user = await User.findOne({
            where: { id: req.userId },
            include: [{ model: Role }]
        });

        if (!user) {
            
            return res.status(404).json({ 
                status: 'error',
                message: 'User not found' 
            });
        }

        const userRole = user.Role.name;
        
        // Admin has access to everything
        if (userRole === ROLES.ADMIN) {
            next();
            return;
        }
        

        // Check if user's role is in the allowed roles array
        if (Array.isArray(roles)) {
            if (!roles.includes(userRole)) {
                return res.status(403).json({ 
                    status: 'error',
                    message: 'Access denied' 
                });
            }
        } else if (roles !== userRole) {
            return res.status(403).json({ 
                status: 'error',
                message: 'Access denied' 
            });
        }

        console.log('Reference ID (Controller ID):', req.referenceId);
        console.log('Reference Type:', req.referenceType);

        next();
    } catch (error) {
        console.error('Role middleware error:', error);
        return res.status(500).json({ 
            status: 'error',
            message: 'Internal server error checking role' 
        });
    }
};

// Verify site access for site engineer
const verifySiteAccess = async (req, res, next) => {
    try {
        const siteId = req.params.siteId || req.body.siteId;
        
        if (!siteId) {
            return res.status(400).json({
                status: 'error',
                message: 'Site ID is required'
            });
        }

        const user = await User.findOne({
            where: { 
                id: req.userId,
                reference_type: 'SITE_ENGINEER'
            }
        });

        // Only check site access for site engineers
        if (user && user.Role.name === ROLES.SITE_ENGINEER) {
            if (user.reference_id !== siteId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this site'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Site access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying site access'
        });
    }
};

// Verify district access for explosive controller
const verifyDistrictAccess = async (req, res, next) => {
    try {
        const district = req.params.district || req.body.district;
        
        if (!district) {
            return res.status(400).json({
                status: 'error',
                message: 'District is required'
            });
        }

        const user = await User.findOne({
            where: { 
                id: req.userId,
                reference_type: 'EXPLOSIVE_CONTROLLER'
            }
        });

        if (user && user.Role.name === ROLES.EXPLOSIVE_CONTROLLER) {
            // Check if controller has access to this district
            const controller = await ExplosiveController.findOne({
                where: {
                    ControllerID: user.reference_id,
                    District: district
                }
            });

            if (!controller) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied to this district'
                });
            }
        }

        next();
    } catch (error) {
        console.error('District access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying district access'
        });
    }
};

// Example: Role-based resource access
const isResourceOwner = (model) => async (req, res, next) => {
    try {
        const resourceId = req.params.id;
        const resource = await model.findByPk(resourceId);

        if (!resource) {
            return res.status(404).json({
                status: 'error',
                message: 'Resource not found'
            });
        }

        const user = await User.findByPk(req.userId);

        // Admin has full access
        if (user.Role.name === ROLES.ADMIN) {
            next();
            return;
        }

        // Check resource ownership based on role
        switch (user.Role.name) {
            case ROLES.SITE_ENGINEER:
                if (resource.MiningSiteID !== user.reference_id) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Access denied to this resource'
                    });
                }
                break;

            case ROLES.EXPLOSIVE_CONTROLLER:
                if (resource.ControllerID !== user.reference_id) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Access denied to this resource'
                    });
                }
                break;

            case ROLES.EXPLOSIVE_DEALER:
                if (resource.DealerID !== user.reference_id) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Access denied to this resource'
                    });
                }
                break;
        }

        next();
    } catch (error) {
        console.error('Resource access verification error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error verifying resource access'
        });
    }
};

module.exports = {
    ROLES,
    hasRole,
    verifySiteAccess,
    verifyDistrictAccess,
    isResourceOwner
};
  