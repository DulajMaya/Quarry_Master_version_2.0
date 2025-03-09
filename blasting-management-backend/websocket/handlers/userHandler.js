const { SOCKET_EVENTS } = require('../services/socketEvents');
const { User, Role } = require('../../models');
const SessionModel = require('../models/session.model');

class UserHandler {
    constructor(io, socketManager) {
        this.io = io;
        this.socketManager = socketManager;
    }

    async handleUserStatusChange(userId, status) {
        try {
            // Update user status in database
            await User.update(
                { status },
                { where: { id: userId } }
            );

            // Get user with role info
            const user = await User.findOne({
                where: { id: userId },
                include: [{ model: Role }]
            });

            // Notify specific users based on role
            if (user) {
                // Notify admins
                this.socketManager.emitToRole('ROLE_ADMIN', SOCKET_EVENTS.USER_STATUS_CHANGED, {
                    userId,
                    status,
                    userRole: user.Role.name
                });

                // If user is site engineer, notify related explosive controllers
                if (user.Role.name === 'ROLE_SITE_ENGINEER') {
                    this.notifyRelatedControllers(userId, status);
                }

                // If status is inactive/deleted, force logout
                if (!status) {
                    await this.handleUserDeleted(userId);
                }
            }

            return true;
        } catch (error) {
            console.error('User status change error:', error);
            return false;
        }
    }

    async handleUserDeleted(userId) {
        try {
            // Emit user deleted event
            this.socketManager.emitToUser(userId, SOCKET_EVENTS.USER_DELETED, {
                message: 'Your account has been deleted'
            });

            // Force logout all user sessions
            await this.socketManager.forceLogoutUser(userId, 'Account deleted');

            // Clear user sessions from Redis
            await SessionModel.deleteUserSessions(userId);

            console.log(`User ${userId} deleted and logged out from all sessions`);
            return true;
        } catch (error) {
            console.error('User deletion handler error:', error);
            return false;
        }
    }

    async notifyRelatedControllers(siteEngineerId, status) {
        try {
            // Get site engineer's mining site and related explosive controllers
            const siteEngineer = await User.findOne({
                where: { 
                    id: siteEngineerId,
                    reference_type: 'SITE_ENGINEER'
                },
                include: [
                    { 
                        model: Role,
                        where: { name: 'ROLE_SITE_ENGINEER' }
                    }
                ]
            });

            if (siteEngineer && siteEngineer.reference_id) {
                // Get explosive controllers for the district
                const controllers = await User.findAll({
                    where: {
                        reference_type: 'EXPLOSIVE_CONTROLLER'
                    },
                    include: [
                        {
                            model: Role,
                            where: { name: 'ROLE_EXPLOSIVE_CONTROLLER' }
                        }
                    ]
                });

                // Notify each controller
                controllers.forEach(controller => {
                    this.socketManager.emitToUser(controller.id, SOCKET_EVENTS.USER_STATUS_CHANGED, {
                        userId: siteEngineerId,
                        status,
                        type: 'SITE_ENGINEER',
                        siteId: siteEngineer.reference_id
                    });
                });
            }
        } catch (error) {
            console.error('Related controllers notification error:', error);
        }
    }

    async handleRoleChange(userId, newRole) {
        try {
            // Notify the user about role change
            this.socketManager.emitToUser(userId, 'role_changed', {
                newRole,
                message: `Your role has been updated to ${newRole}`
            });

            // Force reconnect to update socket rooms
            await this.socketManager.forceLogoutUser(userId, 'Role updated, please login again');

            return true;
        } catch (error) {
            console.error('Role change handler error:', error);
            return false;
        }
    }

    registerHandlers(socket) {
        const { user } = socket;

        if (!user) return;

        socket.on('user_status_update', async (data) => {
            if (user.Role.name === 'ROLE_ADMIN') {
                await this.handleUserStatusChange(data.userId, data.status);
            }
        });

        socket.on('role_update', async (data) => {
            if (user.Role.name === 'ROLE_ADMIN') {
                await this.handleRoleChange(data.userId, data.newRole);
            }
        });
    }
}

module.exports = UserHandler;