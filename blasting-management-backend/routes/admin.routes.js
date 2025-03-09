// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { hasRole } = require('../middleware/role.middleware');
const { ROLES } = require('../middleware/role.middleware');

// Protected admin routes - only accessible by admin
router.use(authMiddleware.verifyToken, hasRole(ROLES.ADMIN));

// Create new user
router.post('/users', adminController.createUser);

// You might want to add these routes later:
// router.get('/users', adminController.getAllUsers);
// router.get('/users/:id', adminController.getUser);
// router.put('/users/:id', adminController.updateUser);
// router.delete('/users/:id', adminController.deleteUser);

module.exports = router;