const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');

// Route to get all roles
router.get('/', roleController.getAllRoles);

module.exports = router;
