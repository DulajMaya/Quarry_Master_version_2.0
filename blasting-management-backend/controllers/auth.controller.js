/*
const authService = require('../services/auth.service');
const { success, error } = require('../utils/response');


exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    success(res, user, 'User registered successfully. Awaiting admin approval.');
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  }
 }

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, role } = await authService.login(email, password);
    res.status(200).json({ token, role });
  } catch (err) {
    console.error(err);

    // Send the correct status code and message to the client
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
  
};


}*/
/*
// controllers/auth.controller.js
const authService = require('../services/auth.service');
const {ResponseUtil,formatResponse} = require('../utils/response');
const { UserSession } = require('../models');
const SessionManager = require('../websocket/services/sessionManager');

exports.signup = async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    return formatResponse(
      res, 
      201, 
      'User registered successfully. Awaiting admin approval.',
      user
    );
  } catch (err) {
    console.error('Signup error:', err);
    if (err.message === 'Email already exists') {
      return ResponseUtil.badRequestResponse(res, 'Email already exists');
    }
    return ResponseUtil.errorResponse(
      res, 
      err.status || 500, 
      err.message || 'Failed to register user',
      err
    );
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return ResponseUtil.badRequestResponse(res, 'Email and password are required');
    }

    const { token, role, user } = await authService.login(email, password);

    // Create user session
    const sessionManager = new SessionManager(require('../server').getIO());
    await sessionManager.createSession(user.id, req.ip, token, {
        userAgent: req.headers['user-agent'],
        loginTime: new Date()
    });
    
    return formatResponse(res, 200, 'Login successful', {
      token,
      role,
      user
    });
  } catch (err) {
    console.error('Login error:', err);

    // Handle specific error cases
    switch (err.message) {
      case 'User not found':
        return ResponseUtil.notFoundResponse(res, 'User not found');
      case 'Invalid password':
        return ResponseUtil.badRequestResponse(res, 'Invalid credentials');
      case 'Account not approved':
        return ResponseUtil.forbiddenResponse(res, 'Account is pending approval');
      case 'Account inactive':
        return ResponseUtil.forbiddenResponse(res, 'Account is inactive');
      default:
        return ResponseUtil.errorResponse(
          res, 
          err.status || 500, 
          err.message || 'Login failed',
          err
        );
    }
  }
};

/*exports.changePassword = async (req, res) => {
  try {

    console.log('Change password request received:', {
      userId: req.userId,
      body: req.body
  });
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId; // From auth middleware

      if (!currentPassword || !newPassword) {
          return ResponseUtil.badRequestResponse(res, 'Current and new passwords are required');
      }

      console.log('Calling auth service changePassword...');

      const result = await authService.changePassword(
          userId,
          currentPassword,
          newPassword,
          req.user?.is_first_login
      );

      console.log('Password change result:', result);

      return formatResponse(
          res,
          200,
          'Password changed successfully',
          result.data  // Send the complete result data
      );

  } catch (err) {
      console.error('Password change error:', err);
      return ResponseUtil.errorResponse(
          res,
          err.status || 500,
          err.message || 'Failed to change password',
          err
      );
  }
};*/

/*
exports.changePassword = async (req, res) => {
  try {
      console.log('Change password request received:', {
          userId: req.userId,
          body: req.body
      });

      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      if (!currentPassword || !newPassword) {
          return res.status(400).json({
              success: false,
              message: 'Current and new passwords are required'
          });
      }

      const result = await authService.changePassword(
          userId,
          currentPassword,
          newPassword,
          req.user?.is_first_login
      );

      console.log('Full change password result:', result);

      // Direct response without formatResponse
      return res.status(200).json(result); 

  } catch (err) {
      console.error('Password change error:', err);
      return res.status(err.status || 500).json({
          success: false,
          message: err.message || 'Failed to change password',
          error: err
      });
  }
};

// Optional: Add logout endpoint if needed
exports.logout = async (req, res) => {
  try {
    // If you're using tokens, you might not need server-side logout
    // But you can blacklist tokens or handle session cleanup here

    const sessionManager = new SessionManager(require('../server').getIO());
        
        // Terminate user session
    await sessionManager.terminateSession(req.userId);
    return formatResponse(res, 200, 'Logged out successfully');
  } catch (err) {
    console.error('Logout error:', err);
    return ResponseUtil.errorResponse(res, 500, 'Failed to logout', err);
  }
};

// Optional: Add password reset functionality
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return ResponseUtil.badRequestResponse(res, 'Email is required');
    }

    await authService.initiatePasswordReset(email);
    return formatResponse(
      res, 
      200, 
      'Password reset instructions sent to email'
    );
  } catch (err) {
    console.error('Password reset error:', err);
    return ResponseUtil.errorResponse(
      res, 
      500, 
      'Failed to initiate password reset',
      err
    );
  }
};

// Optional: Add refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return ResponseUtil.badRequestResponse(res, 'Refresh token is required');
    }

    const newTokens = await authService.refreshToken(refreshToken);
    return formatResponse(res, 200, 'Token refreshed successfully', newTokens);
  } catch (err) {
    console.error('Token refresh error:', err);
    return ResponseUtil.errorResponse(
      res, 
      err.status || 500, 
      'Failed to refresh token',
      err
    );
  }
};

// Optional: Verify email endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return ResponseUtil.badRequestResponse(res, 'Verification token is required');
    }

    await authService.verifyEmail(token);
    return formatResponse(res, 200, 'Email verified successfully');
  } catch (err) {
    console.error('Email verification error:', err);
    return ResponseUtil.errorResponse(
      res, 
      err.status || 500, 
      'Failed to verify email',
      err
    );
  }
};

exports.verifyToken = async (req, res) => {
  try {
      // Since middleware already verified the token,
      // we can return the user data
      return res.status(200).json({
          success: true,
          valid: true,
          data: {
              userId: req.userId,
              userRole: req.userRole,
              referenceId: req.referenceId,
              referenceType: req.referenceType
          }
      });
  } catch (error) {
      console.error('Verify token error:', error);
      return res.status(500).json({
          success: false,
          message: 'Error verifying token',
          valid: false
      });
  }
};*/

const authService = require('../services/auth.service');
const { UserSession } = require('../models');
const SessionManager = require('../websocket/services/sessionManager');

exports.signup = async (req, res) => {
    try {
        const user = await authService.signup(req.body);
        return res.status(201).json({
            success: true,
            message: 'User registered successfully. Awaiting admin approval.',
            data: user
        });
    } catch (err) {
        console.error('Signup error:', err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Failed to register user',
            error: err
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const result = await authService.login(email, password);

        // Create user session
        const sessionManager = new SessionManager(require('../server').getIO());
        await sessionManager.createSession(result.data.user.id, req.ip, result.data.token, {
            userAgent: req.headers['user-agent'],
            loginTime: new Date()
        });

        return res.status(200).json(result);
    } catch (err) {
        console.error('Login error:', err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Login failed',
            error: err
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        console.log('Change password request received:', {
            userId: req.userId,
            body: req.body
        });

        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current and new passwords are required'
            });
        }

        const result = await authService.changePassword(
            userId,
            currentPassword,
            newPassword
        );

        console.log('Password change result:', result);

        return res.status(200).json(result);

    } catch (err) {
        console.error('Password change error:', err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Failed to change password',
            error: err
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const sessionManager = new SessionManager(require('../server').getIO());
        await sessionManager.terminateSession(req.userId);
        
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to logout',
            error: err
        });
    }
};

exports.verifyToken = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            valid: true,
            data: {
                userId: req.userId,
                userRole: req.userRole,
                referenceId: req.referenceId,
                referenceType: req.referenceType
            }
        });
    } catch (error) {
        console.error('Verify token error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying token',
            valid: false
        });
    }
};
