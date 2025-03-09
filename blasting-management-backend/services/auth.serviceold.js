/*const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { validateSignupData } = require('../utils/validateInput');*/

/*exports.signup = async ({ username, password, email }) => {
  // Validate input
  validateSignupData({ username, password, email });

  const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw {status : 400 , message : "DuplicateEmail"};
    }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user with 'status' set to 'false'
  const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      status: false, // User is not active until admin approves
  });

  return newUser;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ where: { email }, include: Role });
  if (!user) throw { status: 404, message: 'User not found' };
  

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw { status: 401, message: 'Invalid password' };

  if (!user.status) throw { status: 403, message: 'User not approved by admin' };

  const token = jwt.sign(
    { id: user.id, role: user.Role.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );

  return { token, role: user.Role.name };
  
};*/

/*exports.login = async (email, password) => {
  const user = await User.findOne({ 
    where: { email }, 
    include: [
      { 
        model: Role,
        attributes: ['name'] 
      },
      {
        model: SiteEngineer,
        required: false
      },
      {
        model: ExplosiveController,
        required: false
      },
      {
        model: ExplosiveDealer,
        required: false
      }
    ] 
  });

  if (!user) throw { status: 404, message: 'User not found' };
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw { status: 401, message: 'Invalid password' };

  if (!user.status) throw { status: 403, message: 'User not approved by admin' };

  // Update last login
  await user.update({
    last_login: new Date(),
    login_attempts: 0,
    locked_until: null
  });

  const token = jwt.sign(
    { 
      id: user.id, 
      role: user.Role.name,
      reference_id: user.reference_id,
      reference_type: user.reference_type
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );

  return { 
    token, 
    role: user.Role.name,
    reference_type: user.reference_type 
  };
};*/

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, SiteEngineer, ExplosiveController, ExplosiveDealer } = require('../models');
const { validateSignupData } = require('../utils/validateInput');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

// Max login attempts before locking
const MAX_LOGIN_ATTEMPTS = 5;
// Lock duration in minutes
const LOCK_TIME = 30;

exports.signup = async ({ username, password, email, roleId, referenceId, referenceType }) => {
    try {
        // Validate input
        validateSignupData({ username, password, email });

        // Check for existing user
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            throw {
                status: 400,
                message: existingUser.email === email ? "Email already exists" : "Username already exists"
            };
        }

        // Validate role exists
        const role = await Role.findByPk(roleId);
        if (!role) {
            throw { status: 400, message: "Invalid role" };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            role_id: roleId,
            status: false, // Requires admin approval
            reference_id: referenceId,
            reference_type: referenceType,
            created_at: new Date(),
            updated_at: new Date()
        });

        return newUser;
    } catch (error) {
        throw error;
    }
};

/*exports.login = async (email, password) => {
    try {
        // Find user with role and reference entity
        const user = await User.findOne({
            /*where: { email },
            include: [
                { 
                    model: Role,
                    attributes: ['name'] 
                },
                {
                    model: SiteEngineer,
                    required: false
                },
                {
                    model: ExplosiveController,
                    required: false
                },
                {
                    model: ExplosiveDealer,
                    required: false,
                    where: { reference_type: 'EXPLOSIVE_DEALER' } 
                }
            ]
        });*/
        /*where: { 
            email,
            // Filter by reference_type for the User model itself
            [Op.or]: [
                { reference_type: 'SITE_ENGINEER' },
                { reference_type: 'EXPLOSIVE_CONTROLLER' },
                { reference_type: 'EXPLOSIVE_DEALER' },
                { reference_type: 'SYSTEM_ADMIN' } // Include SYSTEM_ADMIN
            ]
        },
        include: [
            { 
                model: Role,
                attributes: ['name'] 
            },
            {
                model: SiteEngineer,
                required: false // Include SiteEngineer if the reference_type matches
            },
            {
                model: ExplosiveController,
                required: false // Include ExplosiveController if the reference_type matches
            },
            {
                model: ExplosiveDealer,
                required: false // Include ExplosiveDealer if the reference_type matches
            }
        ]
    });








        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Check if account is locked
        if (user.locked_until && user.locked_until > new Date()) {
            throw { 
                status: 403, 
                message: 'Account is locked. Please try again later',
                lockExpiry: user.locked_until
            };
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            // Increment login attempts
            const loginAttempts = user.login_attempts + 1;
            
            if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                // Lock account
                await user.update({
                    login_attempts: loginAttempts,
                    locked_until: new Date(Date.now() + LOCK_TIME * 60000) // Convert minutes to milliseconds
                });
                
                throw { 
                    status: 403, 
                    message: `Account locked for ${LOCK_TIME} minutes due to multiple failed attempts`
                };
            }
            
            await user.update({ login_attempts: loginAttempts });
            throw { status: 401, message: 'Invalid password' };
        }

        if (!user.status) {
            throw { status: 403, message: 'User not approved by admin' };
        }

        // Reset login attempts on successful login
        await user.update({
            login_attempts: 0,
            locked_until: null,
            last_login: new Date()
        });

        // Get role-specific data
        let userData = null;
        switch(user.reference_type) {
            case 'SITE_ENGINEER':
                userData = user.SiteEngineer;
                break;
            case 'EXPLOSIVE_CONTROLLER':
                userData = user.ExplosiveController;
                break;
            case 'EXPLOSIVE_DEALER':
                userData = user.ExplosiveDealer;
                break;
            case 'SYSTEM_ADMIN':
                // SYSTEM_ADMIN does not have role-specific data
                userData = null;
                break;
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.Role.name,
                reference_id: user.reference_id,
                reference_type: user.reference_type
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.Role.name,
                reference_type: user.reference_type,
                reference_id: user.reference_id,
                userData: userData // Role-specific data
            }
        };
    } catch (error) {
        throw error;
    }
};*/


exports.login = async (email, password) => {
    try {
        // Find user with role and reference entity (keeping your existing query)
        const user = await User.findOne({
            where: { 
                email,
                [Op.or]: [
                    { reference_type: 'SITE_ENGINEER' },
                    { reference_type: 'EXPLOSIVE_CONTROLLER' },
                    { reference_type: 'EXPLOSIVE_DEALER' },
                    { reference_type: 'SYSTEM_ADMIN' }
                ]
            },
            include: [
                { 
                    model: Role,
                    attributes: ['name'] 
                },
                {
                    model: SiteEngineer,
                    required: false
                },
                {
                    model: ExplosiveController,
                    required: false
                },
                {
                    model: ExplosiveDealer,
                    required: false
                }
            ]
        });

        console.log('User data at login:', {
            is_first_login: user.is_first_login,
            password_change_required: user.password_change_required
        });

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Check if account is locked (keeping your existing lock check)
        if (user.locked_until && user.locked_until > new Date()) {
            throw { 
                status: 403, 
                message: 'Account is locked. Please try again later',
                lockExpiry: user.locked_until
            };
        }

        // Check if temporary password has expired (new)
        if (user.temp_password_expiry && user.temp_password_expiry < new Date()) {
            throw { 
                status: 403, 
                message: 'Temporary password has expired. Please contact administrator.' 
            };
        }

        // Verify password (keeping your existing password check)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            const loginAttempts = user.login_attempts + 1;
            
            if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
                await user.update({
                    login_attempts: loginAttempts,
                    locked_until: new Date(Date.now() + LOCK_TIME * 60000)
                });
                
                throw { 
                    status: 403, 
                    message: `Account locked for ${LOCK_TIME} minutes due to multiple failed attempts`
                };
            }
            
            await user.update({ login_attempts: loginAttempts });
            throw { status: 401, message: 'Invalid password' };
        }

        if (!user.status) {
            throw { status: 403, message: 'User not approved by admin' };
        }

        // Reset login attempts and update last login (keeping your existing update)
        await user.update({
            login_attempts: 0,
            locked_until: null,
            last_login: new Date()
        });

        // Get role-specific data (keeping your existing switch)
        let userData = null;
        switch(user.reference_type) {
            case 'SITE_ENGINEER':
                userData = user.SiteEngineer;
                break;
            case 'EXPLOSIVE_CONTROLLER':
                userData = user.ExplosiveController;
                break;
            case 'EXPLOSIVE_DEALER':
                userData = user.ExplosiveDealer;
                break;
            case 'SYSTEM_ADMIN':
                userData = null;
                break;
        }

        // Generate token (adding new fields for password change requirement)
        const token = jwt.sign(
            {
                id: user.id,
                role: user.Role.name,
                reference_id: user.reference_id,
                reference_type: user.reference_type,
                password_change_required: user.password_change_required // New field
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.Role.name,
                reference_type: user.reference_type,
                reference_id: user.reference_id,
                userData: userData,
                is_first_login: user.is_first_login,                    // New field
                password_change_required: user.password_change_required // New field
            }
        };
    } catch (error) {
        throw error;
    }
};

/*exports.changePassword = async (userId, currentPassword, newPassword, isFirstLogin = false) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw { status: 401, message: 'Current password is incorrect' };
        }

        // Validate new password
        const passwordErrors = validatePasswordStrength(newPassword);
        if (passwordErrors.length > 0) {
            throw { status: 400, message: 'Invalid password', errors: passwordErrors };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user record
        await user.update({
            password: hashedPassword,
            is_first_login: false,
            password_change_required: false,
            temp_password_expiry: null,
            last_password_change: new Date()
        });

        // If this was first login or forced password change, generate new token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.Role.name,
                reference_id: user.reference_id,
                reference_type: user.reference_type,
                password_change_required: false
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        return { token };
    } catch (error) {
        throw error;
    }
};*/


exports.changePassword = async (userId, currentPassword, newPassword, isFirstLogin = false) => {
    console.log('Starting password change for userId:', userId);
    const transaction = await sequelize.transaction();
    try {
        console.log('Finding user...');
        // Find user with Role association
        const user = await User.findByPk(userId, {
            
            include: [
                { 
                    model: Role,
                    attributes: ['name'] 
                },
                {
                    model: SiteEngineer,
                    required: false
                },
                {
                    model: ExplosiveController,
                    required: false
                },
                {
                    model: ExplosiveDealer,
                    required: false
                }
            ],
            transaction
        });
        console.log('Found user:', user ? 'yes' : 'no');

        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        // Verify current password
        console.log('Verifying current password...');
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw { status: 401, message: 'Current password is incorrect' };
        }
        console.log('Password valid:', isPasswordValid);

        // Validate new password
        const passwordErrors = validatePasswordStrength(newPassword);
        if (passwordErrors.length > 0) {
            throw { status: 400, message: 'Invalid password', errors: passwordErrors };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Updating user record...');

        // Update user record
        await user.update({
            password: hashedPassword,
            is_first_login: false,
            password_change_required: false,
            temp_password_expiry: null,
            last_password_change: new Date()
        },{ transaction });

        console.log('Before commit - user values:', {
            is_first_login: user.is_first_login,
            password_change_required: user.password_change_required
        });

        await transaction.commit();
        console.log('Transaction committed');

        // Reload user to get updated values
        await user.reload();

        console.log('User after reload:', {
            is_first_login: user.is_first_login,
            password_change_required: user.password_change_required
        });

        // Get role-specific data
        let userData = null;
        switch(user.reference_type) {
            case 'SITE_ENGINEER':
                userData = user.SiteEngineer;
                break;
            case 'EXPLOSIVE_CONTROLLER':
                userData = user.ExplosiveController;
                break;
            case 'EXPLOSIVE_DEALER':
                userData = user.ExplosiveDealer;
                break;
            case 'SYSTEM_ADMIN':
                userData = null;
                break;
        }

        // Generate new token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.Role.name,
                reference_id: user.reference_id,
                reference_type: user.reference_type,
                password_change_required: false
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );

        // Return response matching frontend expectations
        return {
            success: true,
            message: 'Password changed successfully',
            data: {
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.Role.name,
                    reference_type: user.reference_type,
                    reference_id: user.reference_id,
                    userData: userData,
                    is_first_login: false,
                    password_change_required: false
                }
            }
        };

    } catch (error) {
        await transaction.rollback();
        // Handle known errors
        if (error.status) {
            throw error;
        }
        // Handle unexpected errors
        console.error('Password change error:', error);
        throw { status: 500, message: 'Internal server error during password change' };
    }
};

// Password reset request
exports.requestPasswordReset = async (email) => {
    // Implement password reset logic
};

// Validate password reset token
exports.validateResetToken = async (token) => {
    // Implement token validation logic
};

// Reset password
exports.resetPassword = async (token, newPassword) => {
    // Implement password reset logic
};

// Change password
exports.changePassword = async (userId, oldPassword, newPassword) => {
    try {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw { status: 404, message: 'User not found' };
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            throw { status: 401, message: 'Current password is incorrect' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({
            password: hashedPassword,
            password_changed_at: new Date(),
            force_password_change: false
        });

        return { message: 'Password updated successfully' };
    } catch (error) {
        throw error;
    }
};

module.exports = exports;


