// routes/explosive/allocation.routes.js
const router = require('express').Router();
const allocationController = require('../../controllers/explosive/allocation.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { hasRole } = require('../../middleware/role.middleware');

router.post('/', 
   [verifyToken, hasRole(['SITE_ENGINEER'])],
   allocationController.createAllocation
);

router.put('/:allocation_id/approve',
   [verifyToken, hasRole(['SITE_ENGINEER'])], 
   allocationController.approveAllocation
);

router.post('/:allocation_id/return',
   [verifyToken, hasRole(['SITE_ENGINEER'])],
   allocationController.processReturn
);

module.exports = router;

