/* const roleService = require('../services/role.service');
const ResponseUtil = require('../utils/response');
const { success, error } = require('../utils/response');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await roleService.fetchAllRoles();
    return ResponseUtil.successResponse(res,  'Roles fetched successfully');
  } catch (err) {
    console.error('Error fetching roles:', err);
    return ResponseUtil.errorResponse(res, 'Failed to fetch roles');
  }
}; */
// controllers/role.controller.js
const roleService = require('../services/role.service');
const {ResponseUtil,formatResponse}= require('../utils/response');

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await roleService.fetchAllRoles();
    return formatResponse(res, 200, 'Roles fetched successfully', roles);
  } catch (err) {
    console.error('Error fetching roles:', err);
    return ResponseUtil.errorResponse(res, 500, 'Failed to fetch roles', err);
  }
};

// Add other role controller methods with consistent response format
exports.createRole = async (req, res) => {
  try {
    const role = await roleService.createRole(req.body);
    return formatResponse(res, 201, 'Role created successfully', role);
  } catch (err) {
    console.error('Error creating role:', err);
    return ResponseUtil.errorResponse(res, 500, 'Failed to create role', err);
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await roleService.findRoleById(req.params.id);
    if (!role) {
      return ResponseUtil.notFoundResponse(res, 'Role not found');
    }
    return formatResponse(res, 200, 'Role fetched successfully', role);
  } catch (err) {
    console.error('Error fetching role:', err);
    return ResponseUtil.errorResponse(res, 500, 'Failed to fetch role', err);
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) {
      return ResponseUtil.notFoundResponse(res, 'Role not found');
    }
    return formatResponse(res, 200, 'Role updated successfully', role);
  } catch (err) {
    console.error('Error updating role:', err);
    return ResponseUtil.errorResponse(res, 500, 'Failed to update role', err);
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const result = await roleService.deleteRole(req.params.id);
    if (!result) {
      return ResponseUtil.notFoundResponse(res, 'Role not found');
    }
    return formatResponse(res, 200, 'Role deleted successfully');
  } catch (err) {
    console.error('Error deleting role:', err);
    return ResponseUtil.errorResponse(res, 500, 'Failed to delete role', err);
  }
};
