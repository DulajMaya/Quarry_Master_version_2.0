// routes/test-blast.routes.js
const express = require('express');
const router = express.Router();
const testBlastController = require('../controllers/test-blast.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { hasRole, ROLES } = require('../middleware/role.middleware');
const { blastSketch, handleUploadError } = require('../middleware/blastupload')


router.get('/details',
    [verifyToken ,hasRole([ROLES.SITE_ENGINEER])],
    testBlastController.getAllTestBlastDetails
);

// Test Blast Details Routes
router.post(
    '/details', [verifyToken],
    testBlastController.createTestBlastDetails
);


router.get(
    '/details/:id',[verifyToken],
    testBlastController.getTestBlastDetailsById
);

router.patch(
    '/details/:id/approval',[verifyToken],
    testBlastController.updateTestBlastApproval
);

// Test Blast Routes
router.post(
    '/blast',[verifyToken],
    blastSketch,  // Middleware for handling file upload
    testBlastController.createTestBlast
);

/*router.get(
    '/details',[verifyToken],
    testBlastController.getAllTestBlastDetails
);*/

router.get(
    '/blast/:blastId',[verifyToken],
    testBlastController.getTestBlastById
);

// Test Blast Hole Routes
router.post(
    '/blast/hole',[verifyToken],
    testBlastController.createTestBlastHole
);

// Monitoring Routes
router.get(
    '/blast/:blastId/monitoring',[verifyToken],
    testBlastController.getTestBlastMonitoring
);

// File Download Routes
router.get(
    '/blast/:blastId/sketch',[verifyToken],
    testBlastController.downloadBlastSketch
);

// License and Site Related Routes
router.get(
    '/license/:licenseId/blasts',[verifyToken],
    testBlastController.getTestBlastsByLicense
);

router.get(
    '/site/:siteId/blasts',[verifyToken],
    testBlastController.getTestBlastsBySite
);

module.exports = router;

