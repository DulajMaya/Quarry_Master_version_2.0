/*
// controllers/mining-site.controller.js
const miningSiteService = require('../services/mining-site.service');
const { 
    validateCreateSite, 
    validateUpdateSite, 
    validateSearchQuery 
} = require('../utils/validateInput-miningsite');
const { formatResponse, errorResponse } = require('../utils/response');
const ResponseUtil = require('../utils/response');

class MiningSiteController {
    async createSite(req, res) {
        try {
            const validationRules = {
                license_id: { type: 'number', required: true },
                site_name: { type: 'string', required: true },
                site_address: { type: 'string', required: true },
                site_district: { type: 'string', required: true },
                site_mining_engineer: { type: 'string', required: true },
                site_kadawala_gps_north: { type: 'number', required: true },
                site_kadawala_gps_east: { type: 'number', required: true }
            };

            const validatedData = validateCreateSite(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const site = await miningSiteService.createSite(req.body);
            return formatResponse(res, 201, 'Mining site created successfully', site);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async updateSite(req, res) {
        try {
            const { siteId } = req.params;
            const validationRules = {
                site_name: { type: 'string', required: false },
                site_address: { type: 'string', required: false },
                site_district: { type: 'string', required: false },
                site_mining_engineer: { type: 'string', required: false },
                site_kadawala_gps_north: { type: 'number', required: false },
                site_kadawala_gps_east: { type: 'number', required: false }
            };

            const validatedData = validateUpdateSite(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const updatedSite = await miningSiteService.updateSite(siteId, req.body);
            return formatResponse(res, 200, 'Mining site updated successfully', updatedSite);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getSiteById(req, res) {
        try {
            const { siteId } = req.params;
            const site = await miningSiteService.getSiteById(siteId);
            
            if (!site) {
                return errorResponse(res, 404, 'Mining site not found');
            }

            return formatResponse(res, 200, 'Mining site retrieved successfully', site);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getSiteWithDetails(req, res) {
        try {
            const { siteId } = req.params;
            const site = await miningSiteService.getSiteWithDetails(siteId);
            
            if (!site) {
                return errorResponse(res, 404, 'Mining site not found');
            }

            return formatResponse(res, 200, 'Mining site details retrieved successfully', site);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getSitesByLicense(req, res) {
        try {
            const { licenseId } = req.params;
            const sites = await miningSiteService.getSitesByLicense(licenseId);
            return formatResponse(res, 200, 'Mining sites retrieved successfully', sites);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async searchSites(req, res) {
        try {
            const { searchTerm, district } = req.query;
            const sites = await miningSiteService.searchSites(searchTerm, district);
            return formatResponse(res, 200, 'Mining sites search results', sites);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async deactivateSite(req, res) {
        try {
            const { siteId } = req.params;
            const site = await miningSiteService.deactivateSite(siteId);
            return formatResponse(res, 200, 'Mining site deactivated successfully', site);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getSiteStatistics(req, res) {
        try {
            const { siteId } = req.params;
            const stats = await miningSiteService.getSiteStatistics(siteId);
            return formatResponse(res, 200, 'Site statistics retrieved successfully', stats);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async validateSiteOperation(req, res) {
        try {
            const { siteId } = req.params;
            const validationResult = await miningSiteService.validateSiteOperation(siteId);
            return formatResponse(res, 200, 'Site validation completed', validationResult);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new MiningSiteController();*/
// controllers/mining-site.controller.js
const miningSiteService = require('../services/mining-site.service');
const {ResponseUtil, formatResponse, errorResponse } = require('../utils/response');


class MiningSiteController {
    // Create new mining site
    async createSite(req, res) {
        try {
            const site = await miningSiteService.createSite(req.body);
            return formatResponse(res, 201, "Mining site created successfully", site);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // Get all mining sites with filters
    async getAllSites(req, res) {
        try {
            const filters = {
                status: req.query.status,
                district: req.query.district,
                search: req.query.search,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                sortBy: req.query.sortBy || 'created_at',
                sortOrder: (req.query.sortOrder || 'DESC').toUpperCase()
            };

            const { rows: sites, count: total } = await miningSiteService.getAllSites(filters);
            
            return formatResponse(res, 200, "Mining sites retrieved successfully", {
                sites,
                pagination: {
                    total,
                    page: filters.page,
                    limit: filters.limit,
                    totalPages: Math.ceil(total / filters.limit)
                }
            });
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // Get mining site by ID
    async getSiteById(req, res) {
        try {
            const site = await miningSiteService.getSiteById(req.params.id);
            if (!site) {
                return ResponseUtil.notFoundResponse(res, "Mining site not found");
            }
            return formatResponse(res, 200, "Mining site retrieved successfully", site);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    // Get site with full details
    async getSiteWithDetails(req, res) {
        try {
            const site = await miningSiteService.getSiteWithDetails(req.params.id);
            if (!site) {
                return ResponseUtil.notFoundResponse(res, "Mining site not found");
            }
            return formatResponse(res, 200, "Mining site details retrieved successfully", site);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }

    // Update mining site
    async updateSite(req, res) {
        try {
            const site = await miningSiteService.updateSite(req.params.id, req.body);
            return ResponseUtil.successResponse(res, 200, "Mining site updated successfully", site);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }

    // Get sites by license
    async getSitesByLicense(req, res) {
        try {
            const sites = await miningSiteService.getSitesByLicense(req.params.licenseId);
            return ResponseUtil.successResponse(res, 200, "Mining sites retrieved successfully", sites);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }

    // Search sites
    async searchSites(req, res) {
        try {
            const sites = await miningSiteService.searchSites(req.query.search, req.query.district);
            return ResponseUtil.successResponse(res, 200, "Mining sites search results", sites);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }

    // Deactivate site
    async deactivateSite(req, res) {
        try {
            const site = await miningSiteService.deactivateSite(req.params.id);
            return ResponseUtil.successResponse(res, 200, "Mining site deactivated successfully", site);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }

    // Get site statistics
    async getSiteStatistics(req, res) {
        try {
            const stats = await miningSiteService.getSiteStatistics(req.params.id);
            return ResponseUtil.successResponse(res, 200, "Site statistics retrieved successfully", stats);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }

    // Validate site operation
    async validateSiteOperation(req, res) {
        try {
            const validation = await miningSiteService.validateSiteOperation(req.params.id);
            return ResponseUtil.successResponse(res, 200, "Site validation completed", validation);
        } catch (error) {
            return ResponseUtil.errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new MiningSiteController();