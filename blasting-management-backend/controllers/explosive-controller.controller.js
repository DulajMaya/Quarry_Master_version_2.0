const explosiveControllerService = require('../services/explosive-controller.service');
const { sequelize } = require('../models');

exports.createExplosiveController = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const validationErrors = await explosiveControllerService.validateExplosiveController(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await explosiveControllerService.createExplosiveController(
            {
                name: req.body.name,
                nic: req.body.nic,
                address: req.body.address,
                district: req.body.district,
                contactNumber: req.body.contactNumber,
                email: req.body.email
            },
            {
                username: req.body.username,
                password: req.body.password,
                email: req.body.email
            },
            transaction
        );

        await transaction.commit();

        res.status(201).json({
            status: 'success',
            message: 'Explosive Controller created successfully',
            data: result
        });
    } catch (error) {
        await transaction.rollback();
        console.log(error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating explosive controller'
        });
    }
};

exports.updateExplosiveController = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const controller = await explosiveControllerService.updateExplosiveController(
            req.params.controllerId,
            req.body,
            transaction
        );

        await transaction.commit();

        res.json({
            status: 'success',
            message: 'Explosive Controller updated successfully',
            data: controller
        });
    } catch (error) {
        await transaction.rollback();
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating explosive controller'
        });
    }
};

exports.getExplosiveController = async (req, res) => {
    try {
        const controller = await explosiveControllerService.getExplosiveController(req.params.controllerId);
        if (!controller) {
            return res.status(404).json({
                status: 'error',
                message: 'Explosive Controller not found'
            });
        }

        res.json({
            status: 'success',
            data: controller
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive controller'
        });
    }
};

exports.getAllExplosiveControllers = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            district: req.query.district,
            search: req.query.search
        };

        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await explosiveControllerService.getAllExplosiveControllers(filters, pagination);

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive controllers'
        });
    }
};

exports.getControllersByDistrict = async (req, res) => {
    try {
        const controllers = await explosiveControllerService.getControllersByDistrict(req.params.district);

        res.json({
            status: 'success',
            data: controllers
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving controllers by district'
        });
    }
};

exports.changeControllerStatus = async (req, res) => {
    try {
        const controller = await explosiveControllerService.changeControllerStatus(
            req.params.controllerId,
            req.body.status
        );

        res.json({
            status: 'success',
            message: 'Explosive Controller status updated successfully',
            data: controller
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating controller status'
        });
    }
};

exports.deleteExplosiveController = async (req, res) => {
    try {
        const result = await explosiveControllerService.deleteExplosiveController(req.params.controllerId);

        res.json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error deleting explosive controller'
        });
    }
};