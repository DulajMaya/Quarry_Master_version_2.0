const explosiveDealerService = require('../services/explosive-dealer.service');
const { sequelize } = require('../models');

exports.createExplosiveDealer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const validationErrors = await explosiveDealerService.validateExplosiveDealer(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const result = await explosiveDealerService.createExplosiveDealer(
            {
                name: req.body.name,
                nic: req.body.nic,
                address: req.body.address,
                district: req.body.district,
                contactNumber: req.body.contactNumber,
                email: req.body.email,
                licenseNumber: req.body.licenseNumber
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
            message: 'Explosive Dealer created successfully',
            data: result
        });
    } catch (error) {
        await transaction.rollback();
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating explosive dealer'
        });
    }
};

exports.updateExplosiveDealer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const dealer = await explosiveDealerService.updateExplosiveDealer(
            req.params.dealerId,
            req.body,
            transaction
        );

        await transaction.commit();

        res.json({
            status: 'success',
            message: 'Explosive Dealer updated successfully',
            data: dealer
        });
    } catch (error) {
        await transaction.rollback();
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating explosive dealer'
        });
    }
};

exports.getExplosiveDealer = async (req, res) => {
    try {
        const dealer = await explosiveDealerService.getExplosiveDealer(req.params.dealerId);
        if (!dealer) {
            return res.status(404).json({
                status: 'error',
                message: 'Explosive Dealer not found'
            });
        }

        res.json({
            status: 'success',
            data: dealer
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive dealer'
        });
    }
};

exports.getAllExplosiveDealers = async (req, res) => {
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

        const result = await explosiveDealerService.getAllExplosiveDealers(filters, pagination);

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive dealers'
        });
    }
};

exports.getDealersByDistrict = async (req, res) => {
    try {
        const dealers = await explosiveDealerService.getDealersByDistrict(req.params.district);

        res.json({
            status: 'success',
            data: dealers
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving dealers by district'
        });
    }
};

exports.changeDealerStatus = async (req, res) => {
    try {
        const dealer = await explosiveDealerService.changeDealerStatus(
            req.params.dealerId,
            req.body.status
        );

        res.json({
            status: 'success',
            message: 'Explosive Dealer status updated successfully',
            data: dealer
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating dealer status'
        });
    }
};

exports.deleteExplosiveDealer = async (req, res) => {
    try {
        const result = await explosiveDealerService.deleteExplosiveDealer(req.params.dealerId);

        res.json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error deleting explosive dealer'
        });
    }
};

exports.getDealerSummary = async (req, res) => {
    try {
        const summary = await explosiveDealerService.getDealerSummary(req.params.dealerId);

        res.json({
            status: 'success',
            data: summary
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving dealer summary'
        });
    }
};