// controllers/drilling-site.controller.js
const drillingSiteService = require('../services/drilling-site.service');

class DrillingSiteController {
    async createDrillingSite(req, res) {
        try {
            console.log('Create drilling site request received:', {
                miningSiteId: req.body.miningSiteId,
                userId: req.userId
            });

            const drillingSite = await drillingSiteService.createDrillingSite({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Drilling site created successfully',
                data: drillingSite
            });
        } catch (error) {
            console.error('Error in createDrillingSite controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Error creating drilling site'
            });
        }
    }

    async getDrillingSites(req, res) {
        try {
            console.log('Get drilling sites request received:', {
                miningSiteId: req.params.miningSiteId,
                query: req.query
            });

            const result = await drillingSiteService.getDrillingSites(
                req.params.miningSiteId,
                req.query
            );

            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in getDrillingSites controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Error retrieving drilling sites'
            });
        }
    }

    async getDrillingSiteById(req, res) {
        try {
            console.log('Get drilling site by ID request received:', {
                drilling_site_id: req.params.drilling_site_id,
                //miningSiteId: req.params.miningSiteId
            });

            const drillingSite = await drillingSiteService.getDrillingSiteById(
                req.params.drilling_site_id,
                //req.params.miningSiteId
            );

            return res.status(200).json({
                status: 'success',
                data: drillingSite
            });
        } catch (error) {
            console.error('Error in getDrillingSiteById controller:', error);
            const statusCode = error.message === 'Drilling site not found' ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message || 'Error retrieving drilling site'
            });
        }
    }

    async updateDrillingSite(req, res) {
        try {
            console.log('Update drilling site request received:', {
                drilling_site_id: req.params.drilling_site_id,
                miningSiteId: req.params.miningSiteId
            });

            const drillingSite = await drillingSiteService.updateDrillingSite(
                req.params.drilling_site_id,
                req.params.miningSiteId,
                req.body
            );

            return res.status(200).json({
                status: 'success',
                message: 'Drilling site updated successfully',
                data: drillingSite
            });
        } catch (error) {
            console.error('Error in updateDrillingSite controller:', error);
            const statusCode = error.message === 'Drilling site not found' ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message || 'Error updating drilling site'
            });
        }
    }

    async deleteDrillingSite(req, res) {
        try {
            console.log('Delete drilling site request received:', {
                drilling_site_id: req.params.drilling_site_id,
                miningSiteId: req.params.miningSiteId
            });

            await drillingSiteService.deleteDrillingSite(
                req.params.drilling_site_id,
                req.params.miningSiteId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Drilling site deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteDrillingSite controller:', error);
            const statusCode = error.message === 'Drilling site not found' ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message || 'Error deleting drilling site'
            });
        }
    }
}

module.exports = new DrillingSiteController();