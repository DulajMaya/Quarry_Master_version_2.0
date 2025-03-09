// routes/mining-license.routes.js
const express = require('express');
const router = express.Router();
const MiningLicenseController = require('../controllers/mining-license.controller');
const upload = require('../middleware/upload');

// Create with photo upload
router.post('/', 
    upload.single('license_photo'), // 'license_photo' is the field name in form-data
    MiningLicenseController.create
  );
  
  // Update with photo upload
  router.put('/:id', 
    upload.single('license_photo'),
    MiningLicenseController.update
  );

// Create new license
//router.post('/', MiningLicenseController.create);

// Get all licenses (with optional filters in query params)
router.get('/', MiningLicenseController.getAllLicenses);

// Get specific license by ID
router.get('/:id', MiningLicenseController.getLicenseById);

// Update license
//router.put('/:id', MiningLicenseController.update);

// Delete license
router.delete('/:id', MiningLicenseController.delete);
router.get('/mining-site/:miningId', MiningLicenseController.getLicenseByMiningId);

// Get expiring licenses
router.get('/reports/expiring', MiningLicenseController.getExpiringLicenses);

// Get license statistics
router.get('/reports/statistics', MiningLicenseController.getStatistics);

// Search licenses
router.get('/search/licenses', MiningLicenseController.search);

// Update license status
router.put('/:id/status', MiningLicenseController.updateStatus);
router.delete('/:id/photo', MiningLicenseController.deletePhoto);

module.exports = router;