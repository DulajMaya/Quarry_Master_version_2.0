/*const userservice = require('../services/user.service');
const ResponseUtil = require('../utils/response');

exports.getAllUsers = async (req, res) => {
    try {
      const users = await userservice.fetchAllUsers();
      return ResponseUtil.successResponse(res, users, 'User details fetched successfully.');
    } catch (err) {
      console.error('Error fetching user details:', err);
      return ResponseUtil.errorResponse(res, 'Failed to fetch user details', 500);
    }
  };

  // Approve a user
exports.approveUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await userservice.approveUser(userId);
    return ResponseUtil.successResponse(res, null, 'User approved successfully.');
  } catch (err) {
    console.error('Error approving user:', err);
    return ResponseUtil.errorResponse(res, 'Failed to approve user');
  }
};

// Update user's role
exports.updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  try {
    await userservice.updateUserRole(userId, roleId);
    return ResponseUtil.successResponse(res, 'User role updated successfully.');
  } catch (err) {
    console.error('Error updating user role:', err);
    return ResponseUtil.errorResponse(res, 'Failed to update user role');
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await userservice.deleteUser(userId);
    return ResponseUtil.successResponse(res, null, 'User deleted successfully.');
  } catch (err) {
    console.error('Error deleting user:', err);
    return ResponseUtil.errorResponse(res, 'Failed to delete user');
  }
};*/
// controllers/user.controller.js
const userservice = require('../services/user.service');
const {ResponseUtil, formatResponse } = require('../utils/response');
const SessionManager = require('../websocket/services/sessionManager');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userservice.fetchAllUsers(req.query);
        return formatResponse(res, 200, 'Users fetched successfully', users);
    } catch (err) {
        console.error('Error fetching user details:', err);
        return ResponseUtil.errorResponse(res, 500, 'Failed to fetch user details', err);
    }
};

// Approve a user
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return ResponseUtil.badRequestResponse(res, 'User ID is required');
        }

        const updatedUser = await userservice.approveUser(userId);
        
        if (!updatedUser) {
            return ResponseUtil.notFoundResponse(res, 'User not found');
        }

        return formatResponse(res, 200, 'User approved successfully', updatedUser);
    } catch (err) {
        console.error('Error approving user:', err);
        return ResponseUtil.errorResponse(res, 500, 'Failed to approve user', err);
    }
};

// Update user's role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;

        if (!userId || !roleId) {
            return ResponseUtil.badRequestResponse(res, 'User ID and Role ID are required');
        }

        const updatedUser = await userservice.updateUserRole(userId, roleId);
        
        if (!updatedUser) {
            return ResponseUtil.notFoundResponse(res, 'User not found');
        }

        return formatResponse(res, 200, 'User role updated successfully', updatedUser);
    } catch (err) {
        console.error('Error updating user role:', err);
        return ResponseUtil.errorResponse(res, 500, 'Failed to update user role', err);
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return ResponseUtil.badRequestResponse(res, 'User ID is required');
        }

        // Get session manager
        const sessionManager = new SessionManager(require('../server').getIO());
        
        // Force logout and terminate all sessions before deletion
        await sessionManager.terminateUserSessions(userId);

        const result = await userservice.deleteUser(userId);
        
        if (!result) {
            return ResponseUtil.notFoundResponse(res, 'User not found');
        }

        return formatResponse(res, 200, 'User deleted successfully');
    } catch (err) {
        console.error('Error deleting user:', err);
        return ResponseUtil.errorResponse(res, 500, 'Failed to delete user', err);
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const userDetails = await userservice.getUserDetails(userId);
        return formatResponse(res, 200, 'User details fetched successfully', userDetails);
    } catch (err) {
        return ResponseUtil.errorResponse(res, 500, err.message);
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return ResponseUtil.badRequestResponse(res, 'User ID is required');
        }

        const user = await userservice.findUserById(userId);
        
        if (!user) {
            return ResponseUtil.notFoundResponse(res, 'User not found');
        }

        return formatResponse(res, 200, 'User fetched successfully', user);
    } catch (err) {
        console.error('Error fetching user:', err);
        return ResponseUtil.errorResponse(res, 500, 'Failed to fetch user', err);
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        if (!userId) {
            return ResponseUtil.badRequestResponse(res, 'User ID is required');
        }

        const updatedUser = await userservice.updateUser(userId, updateData);
        
        if (!updatedUser) {
            return ResponseUtil.notFoundResponse(res, 'User not found');
        }

        return formatResponse(res, 200, 'User updated successfully', updatedUser);
    } catch (err) {
        console.error('Error updating user:', err);
        return ResponseUtil.errorResponse(res, 500, 'Failed to update user', err);
    }
};