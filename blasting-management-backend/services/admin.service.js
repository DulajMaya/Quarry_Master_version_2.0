// services/admin.service.js
//const { User, Role } = require('../models');
const sequelize = require('../config/db.config');
const idGenerator = require('./id-generator.service');
const notificationService = require('../notifications/services/notification.service');
const { generateTempPassword , hashPassword} = require('../utils/password.util');
const { User, Role, SiteEngineer, ExplosiveController, ExplosiveDealer } = require('../models');

class AdminService {
    async createUser(userType, userData, roleData, adminUserId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Generate appropriate ID based on user type
            let referenceId;
            switch (userType) {
                case 'SITE_ENGINEER':
                    referenceId = await idGenerator.generateEngineerId();
                    break;
                case 'EXPLOSIVE_CONTROLLER':
                    referenceId = await idGenerator.generateControllerId();
                    break;
                case 'EXPLOSIVE_DEALER':
                    referenceId = await idGenerator.generateDealerId();
                    break;
                default:
                    throw new Error('Invalid user type');
            }

            let roleId;
        switch (userType) {
            case 'SITE_ENGINEER':
                roleId = await Role.findOne({ where: { name: 'ROLE_SITE_ENGINEER' } });
                break;
            case 'EXPLOSIVE_CONTROLLER':
                roleId = await Role.findOne({ where: { name: 'ROLE_EXPLOSIVE_CONTROLLER' } });
                break;
            case 'EXPLOSIVE_DEALER':
                roleId = await Role.findOne({ where: { name: 'ROLE_EXPLOSIVE_DEALER' } });
                break;
            default:
                throw new Error('Invalid user type');
        }

        if (!roleId) {
            throw new Error('Role not found');
        }

            // Generate temporary password
            const tempPassword = generateTempPassword();
            console.log('Generated temp password:', tempPassword); // Debug log
            // Hash the temporary password
            const hashedPassword = await hashPassword(tempPassword);
            console.log('Hashed password:', hashedPassword); // Debug log
            
            // Create user record
            const user = await User.create({
                ...userData,
                password: hashedPassword, 
                reference_id: referenceId,
                reference_type: userType,
                is_first_login: true,
                role_id: roleId.id,
                password_change_required: true,
                status: true,  // Set this to true
                temp_password_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                created_by: adminUserId  // Add this line
            }, { transaction });

            // Create role-specific record
            await this.createRoleSpecificRecord(userType, referenceId, roleData, transaction);

            

            // Send credentials email
            await notificationService.sendUserCredentials(
                userData.email,
                {
                    username: userData.email,  // Using email for login
                    password: tempPassword,  // We'll send this temporary password
                    userType: userType
                }
            );

            await transaction.commit();

            

            // Don't include password in response
           const userResponse = user.toJSON();
           delete userResponse.password;
            return userResponse;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }


    async createRoleSpecificRecord(userType, referenceId, roleData, transaction) {
        try {
            switch (userType) {
                case 'SITE_ENGINEER':
                    await SiteEngineer.create({
                        EngineerID: referenceId,
                        Name: roleData.name,
                        NIC: roleData.nic,
                        Address: roleData.address,
                        ContactNumber: roleData.contactNumber,
                        Email: roleData.email,
                        MiningSiteID: roleData.miningSiteId,
                        Status: 'Active'
                    }, { transaction });
                    break;

                case 'EXPLOSIVE_CONTROLLER':
                    await ExplosiveController.create({
                        ControllerID: referenceId,
                        Name: roleData.name,
                        NIC: roleData.nic,
                        Address: roleData.address,
                        District: roleData.district,
                        ContactNumber: roleData.contactNumber,
                        Email: roleData.email,
                        Status: 'Active'
                    }, { transaction });
                    break;

                case 'EXPLOSIVE_DEALER':
                    await ExplosiveDealer.create({
                        DealerID: referenceId,
                        Name: roleData.name,
                        NIC: roleData.nic,
                        Address: roleData.address,
                        District: roleData.district,
                        ContactNumber: roleData.contactNumber,
                        Email: roleData.email,
                        LicenseNumber: roleData.licenseNumber,
                        Status: 'Active'
                    }, { transaction });
                    break;

                default:
                    throw new Error('Invalid user type');
            }
        } catch (error) {
            console.error('Error creating role-specific record:', error);
            throw error;
        }
    }





}

module.exports = new AdminService();