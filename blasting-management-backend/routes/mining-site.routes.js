// routes/mining-site.routes.js
const express = require('express');
const router = express.Router();
const miningSiteController = require('../controllers/mining-site.controller');

// Create new site
router.post('/', miningSiteController.createSite);

// Get all sites with filters
router.get('/', miningSiteController.getAllSites);

// Get site by ID
router.get('/:id', miningSiteController.getSiteById);

// Get site with full details
router.get('/:id/details', miningSiteController.getSiteWithDetails);

// Update site
router.put('/:id', miningSiteController.updateSite);

// Get sites by license
router.get('/license/:licenseId', miningSiteController.getSitesByLicense);

// Search sites
router.get('/search/sites', miningSiteController.searchSites);

// Deactivate site
router.patch('/:id/deactivate', miningSiteController.deactivateSite);

// Get site statistics
router.get('/:id/statistics', miningSiteController.getSiteStatistics);

// Validate site operation
router.get('/:id/validate', miningSiteController.validateSiteOperation);

module.exports = router;