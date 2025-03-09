const jwt = require('jsonwebtoken');
const { User, Role } = require('../../models');
const SessionModel = require('../models/session.model');
const socketUtils = require('../utils/socketUtils');

const socketAuth = async (socket, next) => {
    try {
        // Get token from handshake auth or query
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        socketUtils.logSocketEvent(socket, 'authentication_attempt', {
            token: 'exists: ' + !!token
        });

        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user with role
        const user = await User.findOne({
            where: { id: decoded.id },
            include: [{ model: Role }]
        });

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        if (!user.status) {
            return next(new Error('Authentication error: User account is inactive'));
        }

        // Create or update session
        const session = new SessionModel(user.id, socket.id);
        await session.save({
            role: user.Role.name,
            referenceId: user.reference_id,
            referenceType: user.reference_type
        });

        // Attach user and session info to socket
        socket.user = user;
        socket.session = session;

        // Join user-specific room
        socket.join(`user:${user.id}`);
        
        // Join role-specific room
        socket.join(`role:${user.Role.name}`);

        next();
    } catch (error) {
        socketUtils.logSocketEvent(socket, 'authentication_error', error);
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
    }
};

module.exports = socketAuth;