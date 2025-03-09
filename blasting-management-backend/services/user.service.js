
/*const { User, Role, UserSession } = require('../models');
const SessionModel = require('../websocket/models/session.model');

exports.fetchAllUsers = async () => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'status'],
        include: [
          {
            model: Role,
            attributes: ['name'],
          },
        ],
      });
      return users;
    } catch (error) {
      throw new Error('Database query failed');
    }
  };

  // Approve a user
exports.approveUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    user.status = 1;
    await user.save();
  } catch (error) {
    throw new Error('Failed to approve user');
  }
};

// Update user's role
exports.updateUserRole = async (userId, roleId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    user.role_id = roleId;
    await user.save();
  } catch (error) {
    throw new Error('Failed to update user role');
  }
};

// Delete a user
/*
exports.deleteUser = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    await user.destroy();
  } catch (error) {
    throw new Error('Failed to delete user');
  }
};

// Update deleteUser function
exports.deleteUser = async (userId) => {
  try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Get the io instance
      const io = require('../server').io();

      // First terminate all user sessions
      await UserSession.update(
          { isActive: false },
          { where: { userId } }
      );

      // Remove Redis sessions
      await SessionModel.deleteUserSessions(userId);

      // Emit force logout event to all user's sockets
      io.to(`user:${userId}`).emit('force_logout', {
          reason: 'Account has been deleted'
      });

      // Finally delete the user
      await user.destroy();

      return true;
  } catch (error) {
      console.error('Delete user error:', error);
      throw new Error('Failed to delete user');
  }
};*/

// services/user.service.js

// services/user.service.js

const { User, Role, UserSession,SiteEngineer, MiningSite,ExplosiveController,ExplosiveDealer } = require('../models');
const SessionModel = require('../websocket/models/session.model');
const { Op } = require('sequelize');

exports.fetchAllUsers = async (queryParams = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            status,
            sortBy = 'id',
            sortOrder = 'DESC'
        } = queryParams;

        // Calculate offset
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }
        if (status !== undefined) {
            whereClause.status = status === 'true';
        }

        // Build role filter
        const includeClause = {
            model: Role,
            attributes: ['name'],
            where: {}
        };
        if (role) {
            includeClause.where.name = role;
        }

        // Execute query with pagination
        const { rows: users, count: total } = await User.findAndCountAll({
            attributes: ['id', 'username', 'email', 'status'],
            include: [includeClause],
            where: whereClause,
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: offset
        });

        // Return in format compatible with your controller
        return {
            users: users,
            meta: {
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                pageSize: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Error in fetchAllUsers:', error);
        throw new Error('Database query failed');
    }
};



// In user.service.js (backend)
exports.getUserDetails = async (userId) => {
    try {
        const user = await User.findByPk(userId, {

            attributes: { 
                exclude: ['password', 'temp_password_expiry', 'last_password_change'] 
            },


            include: [
                {
                    model: Role,
                    attributes: ['name'],
                }
            ]
        });

        if (!user) throw new Error('User not found');

        // Get role-specific details based on reference_type
        let additionalDetails = null;
        switch (user.reference_type) {
            case 'SITE_ENGINEER':
                additionalDetails = await SiteEngineer.findOne({
                    where: { EngineerID: user.reference_id },
                    include: [{
                        model: MiningSite,
                        attributes: ['site_name', 'site_district']
                    }]
                });
                break;
            case 'EXPLOSIVE_CONTROLLER':
                additionalDetails = await ExplosiveController.findOne({
                    where: { ControllerID: user.reference_id }
                });
                break;
            case 'EXPLOSIVE_DEALER':
                additionalDetails = await ExplosiveDealer.findOne({
                    where: { DealerID: user.reference_id }
                });
                break;
        }

        return {
            ...user.toJSON(),
            additionalDetails
        };
    } catch (error) {
        throw error;
    }
};

exports.findUserById = async (userId) => {
    try {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    attributes: ['name'],
                }
            ]
        });
        return user;
    } catch (error) {
        console.error('Error finding user:', error);
        throw new Error('Failed to find user');
    }
};

exports.approveUser = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        user.status = 1;
        await user.save();
        return user;
    } catch (error) {
        console.error('Error approving user:', error);
        throw new Error('Failed to approve user');
    }
};

exports.updateUserRole = async (userId, roleId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        user.role_id = roleId;
        await user.save();
        
        // Fetch updated user with role information
        const updatedUser = await User.findByPk(userId, {
            include: [{ model: Role, attributes: ['name'] }]
        });
        return updatedUser;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw new Error('Failed to update user role');
    }
};

exports.updateUser = async (userId, updateData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        await user.update(updateData);
        
        const updatedUser = await User.findByPk(userId, {
            include: [{ model: Role, attributes: ['name'] }]
        });
        return updatedUser;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Failed to update user');
    }
};

exports.deleteUser = async (userId) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return null;

        // First terminate all user sessions
        await UserSession.update(
            { isActive: false },
            { where: { userId } }
        );

        // Remove Redis sessions
        await SessionModel.deleteUserSessions(userId);

        // Delete the user
        await user.destroy();
        return true;
    } catch (error) {
        console.error('Delete user error:', error);
        throw new Error('Failed to delete user');
    }
};