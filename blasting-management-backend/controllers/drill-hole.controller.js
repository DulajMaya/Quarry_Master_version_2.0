// controllers/drill-hole.controller.js
const drillHoleService = require('../services/drill-hole.service');

class DrillHoleController {
    async createDrillHoles(req, res) {
        try {
            console.log('Create drill holes request received:', {
                patternId: req.body.pattern_id,
                numberOfHoles: req.body.holes?.length || 0
            });

            const holes = await drillHoleService.createDrillHoles({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Drill holes created successfully',
                data: {
                    count: holes.length,
                    holes
                }
            });
        } catch (error) {
            console.error('Error in createDrillHoles controller:', error);
            const statusCode = error.message.includes('pattern not found') ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDrillHoles(req, res) {
        try {
            console.log('Get drill holes request received:', {
                patternId: req.params.pattern_id,
                query: req.query
            });

            const result = await drillHoleService.getDrillHoles(
                req.params.pattern_id,
                req.query
            );

            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in getDrillHoles controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving drill holes'
            });
        }
    }

    async updateDrillHole(req, res) {
        try {
            console.log('Update drill hole request received:', {
                holeId: req.params.hole_id
            });

            const hole = await drillHoleService.updateDrillHole(
                req.params.hole_id,
                req.body
            );

            return res.status(200).json({
                status: 'success',
                message: 'Drill hole updated successfully',
                data: hole
            });
        } catch (error) {
            console.error('Error in updateDrillHole controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('status transition') ? 400 : 500;
            
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateDrillHoleStatus(req, res) {
        try {
            console.log('Update drill hole status request received:', {
                holeId: req.params.hole_id,
                status: req.body.status
            });

            const hole = await drillHoleService.updateDrillHoleStatus(
                req.params.hole_id,
                req.body.status,
                req.body.remarks
            );

            return res.status(200).json({
                status: 'success',
                message: 'Drill hole status updated successfully',
                data: hole
            });
        } catch (error) {
            console.error('Error in updateDrillHoleStatus controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('status transition') ? 400 : 500;
            
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }


    async updateBatchStatus(req, res) {
        try {
            console.log('Update batch status request received:', {
                patternId: req.params.pattern_id,
                status: req.body.status,
                holeIds: req.body.hole_ids
            });
    
            const result = await drillHoleService.updateBatchStatus(
                req.params.pattern_id,
                req.body.status,
                req.body.hole_ids,
                req.body.remarks
            );
    
            return res.status(200).json({
                status: 'success',
                message: 'Drill holes status updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in updateBatchStatus controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('status transition') ? 400 : 500;
            
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new DrillHoleController();
