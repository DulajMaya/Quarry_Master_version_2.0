const explosiveStoreService = require('../services/explosive-store.service');

exports.createExplosiveStore = async (req, res) => {
    try {
        const validationErrors = await explosiveStoreService.validateStore(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        const store = await explosiveStoreService.createExplosiveStore(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Explosive store created successfully',
            data: store
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error creating explosive store'
        });
    }
};

exports.updateExplosiveStore = async (req, res) => {
    try {
        const store = await explosiveStoreService.updateExplosiveStore(
            req.params.storeId,
            req.body
        );

        res.json({
            status: 'success',
            message: 'Explosive store updated successfully',
            data: store
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating explosive store'
        });
    }
};

exports.getExplosiveStore = async (req, res) => {
    try {
        const store = await explosiveStoreService.getExplosiveStore(req.params.storeId);

        res.json({
            status: 'success',
            data: store
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive store'
        });
    }
};

exports.getAllExplosiveStores = async (req, res) => {
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

        const result = await explosiveStoreService.getAllExplosiveStores(filters, pagination);

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving explosive stores'
        });
    }
};

exports.changeStoreStatus = async (req, res) => {
    try {
        const store = await explosiveStoreService.changeStoreStatus(
            req.params.storeId,
            req.body.status
        );

        res.json({
            status: 'success',
            message: 'Store status updated successfully',
            data: store
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error updating store status'
        });
    }
};

exports.getStoreSummary = async (req, res) => {
    try {
        const summary = await explosiveStoreService.getStoreSummary(req.params.storeId);

        res.json({
            status: 'success',
            data: summary
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving store summary'
        });
    }
};

exports.getSiteStore = async (req, res) => {
    try {
        const store = await explosiveStoreService.getSiteStore(req.params.miningSiteId);

        res.json({
            status: 'success',
            data: store
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message || 'Error retrieving site store details'
        });
    }
};