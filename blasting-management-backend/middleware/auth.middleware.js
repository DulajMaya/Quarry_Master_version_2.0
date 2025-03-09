/*const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};*/

/*exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.referenceId = decoded.reference_id;
    req.referenceType = decoded.reference_type;
    next();
  });
};*/

const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({
            status: 'error',
            message: 'No token provided'
        });
    }

    // Remove 'Bearer ' if present
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenValue, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        try {
            // Get user with role
            const user = await User.findOne({
                where: { id: decoded.id },
                include: [{ model: Role }]
            });

            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

           /* if (!user.status) {
                return res.status(403).json({
                    status: 'error',
                    message: 'User account is inactive'
                });
            }*/

                if (!user.status) {
                    // Emit force logout through WebSocket if user is inactive
                    const io = require('../server').io();
                    io.to(`user:${user.id}`).emit('force_logout', {
                        reason: 'Account is inactive'
                    });
    
                    return res.status(403).json({
                        status: 'error',
                        message: 'User account is inactive'
                    });
                }

            // Add user info to request
            req.userId = user.id;
            req.userRole = user.Role.name;
            req.referenceId = user.reference_id;
            req.referenceType = user.reference_type;

            console.log('Reference ID (Controller ID):', req.referenceId);
            console.log('Reference Type:', req.referenceType);

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error verifying token'
            });
        }
    });
};

// Middleware to check if user is locked
exports.checkUserLock = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        
        if (user && user.locked_until && user.locked_until > new Date()) {
            return res.status(403).json({
                status: 'error',
                message: 'Account is temporarily locked. Please try again later',
                lockExpiry: user.locked_until
            });
        }
        
        next();
    } catch (error) {
        console.error('Lock check error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error checking user lock'
        });
    }
};
