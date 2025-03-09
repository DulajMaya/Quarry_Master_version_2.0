const { Role } = require('../models');

exports.fetchAllRoles = async () => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
    });
    return roles;
  } catch (error) {
    throw new Error('Failed to fetch roles');
  }
}