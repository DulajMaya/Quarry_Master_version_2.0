// controllers/daily-blast-operation.controller.js
/*const dailyBlastOperationService = require('../services/daily-blast-operation.service');

class DailyBlastOperationController {
    async createDailyOperation(req, res) {
        try {
            console.log('Create daily blast operation request received:', {
                miningSiteId: req.body.miningSiteId,
                operationDate: req.body.operation_date,
                userId: req.userId
            });

            const operation = await dailyBlastOperationService.createDailyOperation({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Daily blast operation created successfully',
                data: operation
            });
        } catch (error) {
            console.error('Error in createDailyOperation controller:', error);
            const statusCode = error.message.includes('already exists') ? 409 : 500;
            
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailyOperations(req, res) {
        try {
            console.log('Get daily operations request received:', {
                miningSiteId: req.params.miningSiteId,
                query: req.query
            });

            const result = await dailyBlastOperationService.getDailyOperations(
                req.params.miningSiteId,
                req.query
            );

            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in getDailyOperations controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving daily operations'
            });
        }
    }

    async updateDailyOperation(req, res) {
        try {
            console.log('Update daily operation request received:', {
                dailyBlastId: req.params.daily_blast_id,
                updates: Object.keys(req.body)
            });

            const operation = await dailyBlastOperationService.updateDailyOperation(
                req.params.daily_blast_id,
                {
                    ...req.body,
                    userId: req.userId
                }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Daily blast operation updated successfully',
                data: operation
            });
        } catch (error) {
            console.error('Error in updateDailyOperation controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('status transition') ? 400 :
                error.message.includes('exceeds issued amount') ? 400 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailySummary(req, res) {
        try {
            console.log('Get daily summary request received:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const summary = await dailyBlastOperationService.getDailySummary(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            console.error('Error in getDailySummary controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getMonthlyReport(req, res) {
        try {
            console.log('Get monthly report request received:', {
                miningSiteId: req.params.miningSiteId,
                month: req.query.month,
                year: req.query.year
            });

            const report = await dailyBlastOperationService.getMonthlyReport(
                req.params.miningSiteId,
                req.query.month,
                req.query.year
            );

            return res.status(200).json({
                status: 'success',
                data: report
            });
        } catch (error) {
            console.error('Error in getMonthlyReport controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error generating monthly report'
            });
        }
    }

    async validateExplosiveQuantities(req, res) {
        try {
            console.log('Validate explosive quantities request received:', {
                dailyBlastId: req.params.daily_blast_id,
                explosives: req.body.explosives
            });

            const validation = await dailyBlastOperationService.validateExplosiveQuantities(
                req.params.daily_blast_id,
                req.body.explosives
            );

            if (!validation.isValid) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid explosive quantities',
                    data: validation.violations
                });
            }

            return res.status(200).json({
                status: 'success',
                message: 'Explosive quantities are valid',
                data: validation
            });
        } catch (error) {
            console.error('Error in validateExplosiveQuantities controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getExplosiveSummary(req, res) {
        try {
            console.log('Get explosive summary request received:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const summary = await dailyBlastOperationService.getExplosiveSummary(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            console.error('Error in getExplosiveSummary controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new DailyBlastOperationController();*/

// controllers/daily-blast-operation.controller.js
const dailyBlastService = require('../services/daily-blast-operation.service');

class DailyBlastOperationController {
    async createDailyBlast(req, res) {
        try {
            console.log('Create daily blast operation request:', {
                miningSiteId: req.body.miningSiteId,
                operationDate: req.body.operation_date,
                plannedBlasts: req.body.number_of_planned_blasts
            });

            // Validate required fields
            if (!req.body.miningSiteId || !req.body.operation_date || !req.body.number_of_planned_blasts) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields: miningSiteId, operation_date, number_of_planned_blasts'
                });
            }

            const operation = await dailyBlastService.createDailyBlast({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Daily blast operation created successfully',
                data: operation
            });

        } catch (error) {
            console.error('Error in createDailyBlast controller:', error);
            const statusCode = 
                error.message.includes('already exists') ? 409 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailyBlasts(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                status, 
                startDate, 
                endDate 
            } = req.query;

            console.log('Get daily blasts request:', {
                miningSiteId: req.params.miningSiteId,
                filters: { status, startDate, endDate },
                pagination: { page, limit }
            });

            const results = await dailyBlastService.getDailyBlasts(
                req.params.miningSiteId,
                {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    status,
                    startDate,
                    endDate
                }
            );

            return res.status(200).json({
                status: 'success',
                data: results.operations,
                pagination: {
                    total: results.total,
                    pages: results.pages,
                    currentPage: results.currentPage
                }
            });

        } catch (error) {
            console.error('Error in getDailyBlasts controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailyBlastDetails(req, res) {
        try {
            console.log('Get daily blast details request:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const operation = await dailyBlastService.getDailyBlastDetails(
                req.params.daily_blast_id
            );

            if (!operation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Daily blast operation not found'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: operation
            });

        } catch (error) {
            console.error('Error in getDailyBlastDetails controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getExplosiveBalance(req, res) {
        try {
            console.log('Get explosive balance request:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const balance = await dailyBlastService.getExplosiveBalance(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: balance
            });

        } catch (error) {
            console.error('Error in getExplosiveBalance controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateStatus(req, res) {
        try {
            console.log('Update status request:', {
                dailyBlastId: req.params.daily_blast_id,
                newStatus: req.body.status
            });

            if (!req.body.status) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Status is required'
                });
            }

            const operation = await dailyBlastService.updateStatus(
                req.params.daily_blast_id,
                req.body.status,
                req.userId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Status updated successfully',
                data: operation
            });

        } catch (error) {
            console.error('Error in updateStatus controller:', error);
            const statusCode = 
                error.message.includes('Invalid status') ? 400 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async completeDailyBlast(req, res) {
        try {
            console.log('Complete daily blast request:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const result = await dailyBlastService.completeDailyBlast(
                req.params.daily_blast_id,
                req.userId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Daily blast operation completed successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in completeDailyBlast controller:', error);
            const statusCode = 
                error.message.includes('unbalanced explosives') ? 400 :
                error.message.includes('incomplete blasts') ? 400 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailySummary(req, res) {
        try {
            console.log('Get daily summary request:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const summary = await dailyBlastService.getDailySummary(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: summary
            });

        } catch (error) {
            console.error('Error in getDailySummary controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new DailyBlastOperationController();

