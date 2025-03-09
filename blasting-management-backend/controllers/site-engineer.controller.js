const siteEngineerService = require('../services/site-engineer.service');
const { sequelize } = require('../models');

exports.createSiteEngineer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const validationErrors = await siteEngineerService.validateSiteEngineer(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await siteEngineerService.createSiteEngineer(
            {
                name: req.body.name,
                nic: req.body.nic,
                address: req.body.address,
                contactNumber: req.body.contactNumber,
                email: req.body.email,
                miningSiteId: req.body.miningSiteId
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
            message: 'Site Engineer created successfully',
            data: result
        });
    } catch (error) {
        await transaction.rollback();
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating site engineer'
        });
    }
};

exports.updateSiteEngineer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const engineer = await siteEngineerService.updateSiteEngineer(
            req.params.engineerId,
            req.body,
            transaction
        );

        await transaction.commit();

        res.json({
            status: 'success',
            message: 'Site Engineer updated successfully',
            data: engineer
        });
    } catch (error) {
        await transaction.rollback();
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating site engineer'
        });
    }
};

exports.getSiteEngineer = async (req, res) => {
    try {
        const engineer = await siteEngineerService.getSiteEngineer(req.params.engineerId);
        if (!engineer) {
            return res.status(404).json({
                status: 'error',
                message: 'Site Engineer not found'
            });
        }

        res.json({
            status: 'success',
            data: engineer
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving site engineer'
        });
    }
};

exports.getAllSiteEngineers = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            miningSiteId: req.query.miningSiteId,
            search: req.query.search
        };

        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10
        };

        const result = await siteEngineerService.getAllSiteEngineers(filters, pagination);

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving site engineers'
        });
    }
};

exports.changeSiteEngineerStatus = async (req, res) => {
    try {
        const engineer = await siteEngineerService.changeSiteEngineerStatus(
            req.params.engineerId,
            req.body.status
        );

        res.json({
            status: 'success',
            message: 'Site Engineer status updated successfully',
            data: engineer
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating site engineer status'
        });
    }
};

exports.deleteSiteEngineer = async (req, res) => {
    try {
        const result = await siteEngineerService.deleteSiteEngineer(req.params.engineerId);

        res.json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error deleting site engineer'
        });
    }
};