const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const SessionManager = require('../websocket/services/sessionManager');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
// routes/auth.routes.js
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);

router.post('/verify-token', authMiddleware.verifyToken, authController.verifyToken);

// Test WebSocket Connection
router.get('/test-socket', verifyToken, async (req, res) => {
    try {
        const io = require('../server').getIO();
        io.emit('test', { 
            message: 'Test message',
            userId: req.userId
        });
        res.json({ success: true, message: 'Test message sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test Session Creation
router.post('/test-session', verifyToken, async (req, res) => {
    try {
        const sessionManager = new SessionManager(require('../server').getIO());
        const session = await sessionManager.createSession(
            req.userId, // Authenticated user ID
            'test-socket-id',
            req.headers.authorization?.replace('Bearer ', '')
        );
        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test Force Logout
router.post('/test-force-logout', verifyToken, async (req, res) => {
    try {
        const sessionManager = new SessionManager(require('../server').getIO());
        await sessionManager.terminateUserSessions(req.userId);
        res.json({ success: true, message: 'Force logout successful' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test Get Active Sessions
router.get('/test-active-sessions', verifyToken, async (req, res) => {
    try {
        const sessionManager = new SessionManager(require('../server').getIO());
        const sessions = await sessionManager.getActiveSessions(req.userId);
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
