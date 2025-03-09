const { ExplosiveController, User, Role } = require('../models');
const { generateControllerId } = require('./id-generator.service');
const authService = require('./auth.service');
const { Op } = require('sequelize');

exports.createExplosiveController = async (controllerData, userData, transaction) => {
    try {
        const controllerId = await generateControllerId();
        
        // Create Explosive Controller
        const controller = await ExplosiveController.create({
            ControllerID: controllerId,
            Name: controllerData.name,
            NIC: controllerData.nic,
            Address: controllerData.address,
            District: controllerData.district,
            ContactNumber: controllerData.contactNumber,
            Email: controllerData.email,
            Status: 'Active'
        }, { transaction });

        // Create User Account
        const user = await authService.signup({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            roleId: 6, // ROLE_EXPLOSIVE_CONTROLLER
            referenceId: controllerId,
            referenceType: 'EXPLOSIVE_CONTROLLER'
        }, transaction);

        return { controller, user };
    } catch (error) {
        throw error;
    }
};

exports.updateExplosiveController = async (controllerId, updateData, transaction) => {
    try {
        const controller = await ExplosiveController.findByPk(controllerId);
        if (!controller) {
            throw { status: 404, message: 'Explosive Controller not found' };
        }

        // Update controller details
        await controller.update({
            Name: updateData.name,
            Address: updateData.address,
            District: updateData.district,
            ContactNumber: updateData.contactNumber,
            Email: updateData.email
        }, { transaction });

        // If email is updated, update user account too
        if (updateData.email) {
            await User.update(
                { email: updateData.email },
                { 
                    where: { 
                        reference_id: controllerId,
                        reference_type: 'EXPLOSIVE_CONTROLLER'
                    },
                    transaction 
                }
            );
        }

        return controller;
    } catch (error) {
        throw error;
    }
};

exports.getExplosiveController = async (controllerId) => {
    try {
        return await ExplosiveController.findOne({
            where: { ControllerID: controllerId },
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

exports.getAllExplosiveControllers = async (filters = {}, pagination = {}) => {
    try {
        const { status, district, search } = filters;
        const { page = 1, limit = 10 } = pagination;

        const whereClause = {};
        if (status) whereClause.Status = status;
        if (district) whereClause.District = district;
        if (search) {
            whereClause[Op.or] = [
                { Name: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } },
                { NIC: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await ExplosiveController.findAndCountAll({
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
            controllers: rows
        };
    } catch (error) {
        throw error;
    }
};

exports.getControllersByDistrict = async (district) => {
    try {
        return await ExplosiveController.findAll({
            where: { 
                District: district,
                Status: 'Active'
            },
            include: [{
                model: User,
                attributes: ['username', 'email', 'status']
            }]
        });
    } catch (error) {
        throw error;
    }
};

exports.changeControllerStatus = async (controllerId, status) => {
    try {
        const controller = await ExplosiveController.findByPk(controllerId);
        if (!controller) {
            throw { status: 404, message: 'Explosive Controller not found' };
        }

        await controller.update({ Status: status });

        // Update associated user account status
        await User.update(
            { status: status === 'Active' },
            { 
                where: { 
                    reference_id: controllerId,
                    reference_type: 'EXPLOSIVE_CONTROLLER'
                }
            }
        );

        return controller;
    } catch (error) {
        throw error;
    }
};

exports.deleteExplosiveController = async (controllerId) => {
    const transaction = await sequelize.transaction();
    try {
        const controller = await ExplosiveController.findByPk(controllerId);
        if (!controller) {
            throw { status: 404, message: 'Explosive Controller not found' };
        }

        // Verify if controller has any active permits
        const activePermits = await ExplosivePermit.count({
            where: {
                ControllerID: controllerId,
                Status: 'Active'
            }
        });

        if (activePermits > 0) {
            throw { 
                status: 400, 
                message: 'Cannot delete controller with active permits' 
            };
        }

        // Deactivate instead of delete
        await controller.update({ 
            Status: 'Inactive' 
        }, { transaction });

        // Deactivate user account
        await User.update(
            { status: false },
            { 
                where: { 
                    reference_id: controllerId,
                    reference_type: 'EXPLOSIVE_CONTROLLER'
                },
                transaction 
            }
        );

        await transaction.commit();
        return { message: 'Explosive Controller deactivated successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.validateExplosiveController = async (data) => {
    const errors = [];

    if (!data.name || data.name.length < 3) {
        errors.push('Name must be at least 3 characters long');
    }

    if (!data.nic || !/^[0-9]{9}[vVxX]$/.test(data.nic)) {
        errors.push('Invalid NIC format');
    }

    if (!data.district) {
        errors.push('District is required');
    }

    if (!data.contactNumber || !/^[0-9]{10}$/.test(data.contactNumber)) {
        errors.push('Invalid contact number format');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }

    return errors;
};