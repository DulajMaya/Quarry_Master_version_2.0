// controllers/explosive/allocation.controller.js
const allocationService = require('../../services/explosive/allocation.service');
const blastHoleService = require('../../services/blast-hole.service');

class AllocationController {
    async createAllocation(req, res) {
        try {
            const allocation = await allocationService.createAllocation({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                data: allocation
            });
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async approveAllocation(req, res) {
        try {
            const allocation = await allocationService.approveAllocation(
                req.params.allocation_id,
                {
                    ...req.body,
                    userId: req.userId
                }
            );

            return res.status(200).json({
                status: 'success',
                data: allocation
            });
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async processReturn(req, res) {
        try {
            // Get actual usage from blast holes
            const usageData = await blastHoleService.calculateExplosiveUsage(
                req.params.allocation_id
            );

            // Combine with return data
            const returnData = {
                ...req.body,
                usageData,
                userId: req.userId
            };

            const allocation = await allocationService.processReturn(
                req.params.allocation_id, 
                returnData
            );

            return res.status(200).json({
                status: 'success',
                data: allocation
            });
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new AllocationController();