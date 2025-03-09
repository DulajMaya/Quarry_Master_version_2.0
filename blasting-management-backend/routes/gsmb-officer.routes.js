// routes/gsmb-officer.routes.js
const express = require('express');
const router = express.Router();
const gsmbOfficerController = require('../controllers/gsmb-officer.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { roleMiddleware } = require('../middleware/role.middleware');

// GSMB Officer Management Routes
router.post(
    '/',
 
    gsmbOfficerController.createOfficer
);

router.put(
    '/:officerId',
    gsmbOfficerController.updateOfficer
);

router.get(
    '/:officerId',
    gsmbOfficerController.getOfficerById
);

// Active Officers
router.get(
    '/',
    gsmbOfficerController.getAllActiveOfficers
);

// Officer's Test Blasts
router.get(
    '/:officerId/test-blasts',
    gsmbOfficerController.getOfficerTestBlasts
);

// Status Management
router.patch(
    '/:officerId/deactivate',
    gsmbOfficerController.deactivateOfficer
);

// Search Officers
router.get(
    '/search',
    gsmbOfficerController.searchOfficers
);

module.exports = router;

