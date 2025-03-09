const { SOCKET_EVENTS } = require('../services/socketEvents');
const { User, ExplosivePermit, Role } = require('../../models');

class PermitHandler {
    constructor(io, socketManager) {
        this.io = io;
        this.socketManager = socketManager;
    }

    async handlePermitStatusChange(permitId, status, updatedBy) {
        try {
            const permit = await ExplosivePermit.findOne({
                where: { PermitID: permitId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    },
                    {
                        model: User,
                        as: 'Controller',
                        include: [{ model: Role }]
                    }
                ]
            });

            if (!permit) {
                throw new Error('Permit not found');
            }

            // Prepare notification data
            const notificationData = {
                permitId,
                permitNumber: permit.PermitNumber,
                status,
                updatedAt: new Date(),
                updatedBy
            };

            // Notify site engineer
            if (permit.SiteEngineer) {
                this.socketManager.emitToUser(
                    permit.SiteEngineer.id,
                    SOCKET_EVENTS.PERMIT_STATUS_CHANGED,
                    notificationData
                );
            }

            // Notify explosive controller
            if (permit.Controller) {
                this.socketManager.emitToUser(
                    permit.Controller.id,
                    SOCKET_EVENTS.PERMIT_STATUS_CHANGED,
                    notificationData
                );
            }

            // Notify admins
            this.socketManager.emitToRole(
                'ROLE_ADMIN',
                SOCKET_EVENTS.PERMIT_STATUS_CHANGED,
                notificationData
            );

            return true;
        } catch (error) {
            console.error('Permit status change error:', error);
            return false;
        }
    }

    async handlePermitUpdate(permitId, updateData) {
        try {
            const permit = await ExplosivePermit.findOne({
                where: { PermitID: permitId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    },
                    {
                        model: User,
                        as: 'Controller',
                        include: [{ model: Role }]
                    }
                ]
            });

            if (!permit) {
                throw new Error('Permit not found');
            }

            // Prepare update notification
            const updateNotification = {
                permitId,
                permitNumber: permit.PermitNumber,
                updateType: updateData.type,
                changes: updateData.changes,
                updatedAt: new Date(),
                updatedBy: updateData.updatedBy
            };

            // Notify relevant parties
            if (permit.SiteEngineer) {
                this.socketManager.emitToUser(
                    permit.SiteEngineer.id,
                    SOCKET_EVENTS.PERMIT_UPDATED,
                    updateNotification
                );
            }

            if (permit.Controller) {
                this.socketManager.emitToUser(
                    permit.Controller.id,
                    SOCKET_EVENTS.PERMIT_UPDATED,
                    updateNotification
                );
            }

            return true;
        } catch (error) {
            console.error('Permit update error:', error);
            return false;
        }
    }

    async handlePermitComment(permitId, comment) {
        try {
            const permit = await ExplosivePermit.findOne({
                where: { PermitID: permitId },
                include: [
                    {
                        model: User,
                        as: 'SiteEngineer',
                        include: [{ model: Role }]
                    },
                    {
                        model: User,
                        as: 'Controller',
                        include: [{ model: Role }]
                    }
                ]
            });

            if (!permit) {
                throw new Error('Permit not found');
            }

            // Prepare comment notification
            const commentNotification = {
                permitId,
                permitNumber: permit.PermitNumber,
                comment: comment.content,
                commentedBy: comment.userId,
                commentedAt: new Date()
            };

            // Notify all relevant parties
            const notifyUsers = [
                permit.SiteEngineer?.id,
                permit.Controller?.id
            ].filter(Boolean);

            notifyUsers.forEach(userId => {
                this.socketManager.emitToUser(
                    userId,
                    'permit_comment_added',
                    commentNotification
                );
            });

            return true;
        } catch (error) {
            console.error('Permit comment error:', error);
            return false;
        }
    }

    registerHandlers(socket) {
        const { user } = socket;

        if (!user) return;

        // Listen for permit status updates
        socket.on('update_permit_status', async (data) => {
            if (user.Role.name === 'ROLE_EXPLOSIVE_CONTROLLER' || user.Role.name === 'ROLE_ADMIN') {
                await this.handlePermitStatusChange(data.permitId, data.status, user.id);
            }
        });

        // Listen for permit comments
        socket.on('add_permit_comment', async (data) => {
            await this.handlePermitComment(data.permitId, {
                content: data.comment,
                userId: user.id
            });
        });
    }
}

module.exports = PermitHandler;