const { SiteEngineer, User, Role } = require('../models');
const { generateEngineerId } = require('./id-generator.service');
const authService = require('./auth.service');
const { Op } = require('sequelize');

exports.createSiteEngineer = async (engineerData, userData, transaction) => {
    try {
        const engineerId = await generateEngineerId();
        
        // Create Site Engineer
        const siteEngineer = await SiteEngineer.create({
            EngineerID: engineerId,
            MiningSiteID: engineerData.miningSiteId,
            Name: engineerData.name,
            NIC: engineerData.nic,
            Address: engineerData.address,
            ContactNumber: engineerData.contactNumber,
            Email: engineerData.email,
            Status: 'Active'
        }, { transaction });

        // Create User Account
        const user = await authService.signup({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            roleId: 5, // ROLE_SITE_ENGINEER
            referenceId: engineerId,
            referenceType: 'SITE_ENGINEER'
        }, transaction);

        return { siteEngineer, user };
    } catch (error) {
        throw error;
    }
};

exports.updateSiteEngineer = async (engineerId, updateData, transaction) => {
    try {
        const engineer = await SiteEngineer.findByPk(engineerId);
        if (!engineer) {
            throw { status: 404, message: 'Site Engineer not found' };
        }

        // Update engineer details
        await engineer.update({
            Name: updateData.name,
            Address: updateData.address,
            ContactNumber: updateData.contactNumber,
            Email: updateData.email
        }, { transaction });

        // If email is updated, update user account too
        if (updateData.email) {
            await User.update(
                { email: updateData.email },
                { 
                    where: { 
                        reference_id: engineerId,
                        reference_type: 'SITE_ENGINEER'
                    },
                    transaction 
                }
            );
        }

        return engineer;
    } catch (error) {
        throw error;
    }
};

exports.getSiteEngineer = async (engineerId) => {
    try {
        return await SiteEngineer.findOne({
            where: { EngineerID: engineerId },
            include: [{
                model: User,
                attributes: ['username', 'email', 'status'],
                include: [{ 
                    model: Role,
                    attributes: ['name']
                }]
            }]
        });
    } catch (error) {
        throw error;
    }
};

exports.getAllSiteEngineers = async (filters = {}, pagination = {}) => {
    try {
        const { status, miningSiteId, search } = filters;
        const { page = 1, limit = 10 } = pagination;

        const whereClause = {};
        if (status) whereClause.Status = status;
        if (miningSiteId) whereClause.MiningSiteID = miningSiteId;
        if (search) {
            whereClause[Op.or] = [
                { Name: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } },
                { NIC: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await SiteEngineer.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['username', 'email', 'status'],
                include: [{ 
                    model: Role,
                    attributes: ['name']
                }]
            }],
            offset: (page - 1) * limit,
            limit: parseInt(limit),
            order: [['CreatedAt', 'DESC']]
        });

        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            engineers: rows
        };
    } catch (error) {
        throw error;
    }
};

exports.changeSiteEngineerStatus = async (engineerId, status) => {
    try {
        const engineer = await SiteEngineer.findByPk(engineerId);
        if (!engineer) {
            throw { status: 404, message: 'Site Engineer not found' };
        }

        await engineer.update({ Status: status });

        // Update associated user account status
        await User.update(
            { status: status === 'Active' },
            { 
                where: { 
                    reference_id: engineerId,
                    reference_type: 'SITE_ENGINEER'
                }
            }
        );

        return engineer;
    } catch (error) {
        throw error;
    }
};

exports.deleteSiteEngineer = async (engineerId) => {
    const transaction = await sequelize.transaction();
    try {
        const engineer = await SiteEngineer.findByPk(engineerId);
        if (!engineer) {
            throw { status: 404, message: 'Site Engineer not found' };
        }

        // Deactivate instead of delete
        await engineer.update({ 
            Status: 'Inactive' 
        }, { transaction });

        // Deactivate user account
        await User.update(
            { status: false },
            { 
                where: { 
                    reference_id: engineerId,
                    reference_type: 'SITE_ENGINEER'
                },
                transaction 
            }
        );

        await transaction.commit();
        return { message: 'Site Engineer deactivated successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.validateSiteEngineer = async (data) => {
    // Add validation logic here
    const errors = [];

    if (!data.name || data.name.length < 3) {
        console.log(data.engineerData)
        errors.push('Name must be at least 3 characters long');
    }

    if (!data.nic || !/^[0-9]{9}[vVxX]$/.test(data.nic)) {
        errors.push('Invalid NIC format');
    }

    // Add more validation as needed

    return errors;
};