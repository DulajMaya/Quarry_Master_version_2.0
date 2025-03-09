const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, SiteEngineer, ExplosiveController, ExplosiveDealer } = require('../models');
const { validateSignupData } = require('../utils/validateInput');
const { validatePasswordStrength } = require('../utils/passwordValidator');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30; // minutes

class AuthService {
    async signup({ username, password, email, roleId, referenceId, referenceType }) {
        try {
            validateSignupData({ username, password, email });

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

            const role = await Role.findByPk(roleId);
            if (!role) {
                throw { status: 400, message: "Invalid role" };
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await User.create({
                username,
                password: hashedPassword,
                email,
                role_id: roleId,
                status: false,
                reference_id: referenceId,
                reference_type: referenceType,
                is_first_login: true,
                password_change_required: true,
                created_at: new Date(),
                updated_at: new Date()
            });

            return newUser;
        } catch (error) {
            throw error;
        }
    }

    async login(email, password) {
        try {
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

            if (!user) {
                throw { status: 404, message: 'User not found' };
            }

            await this.checkAccountLock(user);
            await this.validatePassword(user, password);
            await this.checkUserStatus(user);
            
            await this.resetLoginAttempts(user);
            
            const userData = this.getRoleSpecificData(user);
            const token = this.generateToken(user);

            return {
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.Role.name,
                        reference_type: user.reference_type,
                        reference_id: user.reference_id,
                        userData: userData,
                        is_first_login: user.is_first_login,
                        password_change_required: user.password_change_required
                    }
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Finding user for password change:', userId);
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

            if (!user) {
                throw { status: 404, message: 'User not found' };
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw { status: 401, message: 'Current password is incorrect' };
            }

            const passwordErrors = validatePasswordStrength(newPassword);
            if (passwordErrors.length > 0) {
                throw { status: 400, message: 'Invalid password', errors: passwordErrors };
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await user.update({
                password: hashedPassword,
                is_first_login: false,
                password_change_required: false,
                temp_password_expiry: null,
                last_password_change: new Date()
            }, { transaction });

            await transaction.commit();
            console.log('Password update committed');

            await user.reload();
            console.log('User reloaded after password change');

            const userData = this.getRoleSpecificData(user);
            const token = this.generateToken(user);

            return {
                success: true,
                message: 'Password changed successfully',
                data: {
                    token,
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
            console.error('Password change error:', error);
            await transaction.rollback();
            throw error;
        }
    }

    async checkAccountLock(user) {
        if (user.locked_until && user.locked_until > new Date()) {
            throw { 
                status: 403, 
                message: 'Account is locked. Please try again later',
                lockExpiry: user.locked_until
            };
        }
    }

    async validatePassword(user, password) {
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
    }

    async checkUserStatus(user) {
        if (!user.status) {
            throw { status: 403, message: 'User not approved by admin' };
        }
    }

    async resetLoginAttempts(user) {
        await user.update({
            login_attempts: 0,
            locked_until: null,
            last_login: new Date()
        });
    }

    getRoleSpecificData(user) {
        switch(user.reference_type) {
            case 'SITE_ENGINEER':
                return user.SiteEngineer;
            case 'EXPLOSIVE_CONTROLLER':
                return user.ExplosiveController;
            case 'EXPLOSIVE_DEALER':
                return user.ExplosiveDealer;
            case 'SYSTEM_ADMIN':
            default:
                return null;
        }
    }

    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                role: user.Role.name,
                reference_id: user.reference_id,
                reference_type: user.reference_type,
                password_change_required: user.password_change_required
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || '1h' }
        );
    }
}

module.exports = new AuthService();