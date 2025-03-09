// routes/user.routes.js
/*const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Route to get all user details with role and status
router.get('/users', userController.getAllUsers);

// Route to approve a user by ID
router.put('/users/:userId/approve', userController.approveUser);

// Route to update user role by ID
router.put('/users/:userId/role', userController.updateUserRole);

// Route to delete a user by ID
router.delete('/users/:userId', userController.deleteUser);


module.exports = router;*/

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { hasRole } = require('../middleware/role.middleware');
const { ROLES } = require('../middleware/role.middleware');

// Protect all routes
router.use(authMiddleware.verifyToken);

// Routes that require admin role
router.get('/', hasRole(ROLES.ADMIN), userController.getAllUsers);
router.put('/:userId/approve', hasRole(ROLES.ADMIN), userController.approveUser);
router.put('/:userId/role', hasRole(ROLES.ADMIN), userController.updateUserRole);
router.delete('/:userId', hasRole(ROLES.ADMIN), userController.deleteUser);
router.get('/:userId/details', hasRole(ROLES.ADMIN), userController.getUserDetails);

module.exports = router;
