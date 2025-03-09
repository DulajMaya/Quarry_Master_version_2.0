const explosiveTypeService = require('../services/explosive-type.service');

exports.createExplosiveType = async (req, res) => {
    try {
        const validationErrors = await explosiveTypeService.validateExplosiveType(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const explosiveType = await explosiveTypeService.createExplosiveType({
            typeName: req.body.typeName,
            description: req.body.description,
            unitOfMeasurement: req.body.unitOfMeasurement
        });

        res.status(201).json({
            status: 'success',
            message: 'Explosive type created successfully',
            data: explosiveType
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating explosive type'
        });
    }
};

exports.updateExplosiveType = async (req, res) => {
    try {
        const explosiveType = await explosiveTypeService.updateExplosiveType(
            req.params.explosiveTypeId,
            {
                typeName: req.body.typeName,
                description: req.body.description,
                unitOfMeasurement: req.body.unitOfMeasurement
            }
        );

        res.json({
            status: 'success',
            message: 'Explosive type updated successfully',
            data: explosiveType
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating explosive type'
        });
    }
};

exports.getExplosiveType = async (req, res) => {
    try {
        const explosiveType = await explosiveTypeService.getExplosiveType(req.params.explosiveTypeId);

        res.json({
            status: 'success',
            data: explosiveType
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive type'
        });
    }
};

exports.getAllExplosiveTypes = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search
        };

        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await explosiveTypeService.getAllExplosiveTypes(filters, pagination);

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive types'
        });
    }
};

exports.changeExplosiveTypeStatus = async (req, res) => {
    try {
        const explosiveType = await explosiveTypeService.changeExplosiveTypeStatus(
            req.params.explosiveTypeId,
            req.body.status
        );

        res.json({
            status: 'success',
            message: 'Explosive type status updated successfully',
            data: explosiveType
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating explosive type status'
        });
    }
};