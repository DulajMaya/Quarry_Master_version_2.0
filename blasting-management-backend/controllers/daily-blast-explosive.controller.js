// controllers/daily-blast-explosive.controller.js
const dailyBlastExplosiveService = require('../services/daily-blast-explosive.service');

class DailyBlastExplosiveController {
    async createExplosiveAllocation(req, res) {
        try {
            const allocation = await dailyBlastExplosiveService.createExplosiveAllocation({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Explosive allocation created successfully',
                data: allocation
            });
        } catch (error) {
            console.error('Error in createExplosiveAllocation controller:', error);
            const statusCode = error.message.includes('already exists') ? 409 : 500;
            
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateExplosiveUsage(req, res) {
        try {
            const allocation = await dailyBlastExplosiveService.updateExplosiveUsage(
                req.params.daily_blast_explosive_id,
                {
                    ...req.body,
                    userId: req.userId
                }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Explosive usage updated successfully',
                data: allocation
            });
        } catch (error) {
            console.error('Error in updateExplosiveUsage controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('exceeds') ? 400 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailyExplosives(req, res) {
        try {
            const explosives = await dailyBlastExplosiveService.getDailyExplosives(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: explosives
            });
        } catch (error) {
            console.error('Error in getDailyExplosives controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving daily explosives'
            });
        }
    }

    async getDailyExplosiveSummary(req, res) {
        try {
            const summary = await dailyBlastExplosiveService.getDailyExplosiveSummary(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            console.error('Error in getDailyExplosiveSummary controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving explosive summary'
            });
        }
    }
}

module.exports = new DailyBlastExplosiveController();