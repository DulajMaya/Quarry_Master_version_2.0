// controllers/minable-boundary.controller.js
const MinableBoundaryService = require('../services/minable-boundary.service');

class MinableBoundaryController {
    // Create boundary points
    async createBoundaryPoints(req, res) {
        try {
            console.log('Attempting to create boundary points:', {
                siteId: req.body.miningSiteId,
                pointsCount: req.body.boundaries?.length
            });

            const boundaryPoints = await MinableBoundaryService.createBoundaryPoints({
                ...req.body,
                created_by: req.userId
            });

            console.log('Successfully created boundary points:', {
                siteId: req.body.miningSiteId,
                pointsCreated: boundaryPoints.length
            });

            return res.status(201).json({
                status: 'success',
                message: 'Boundary points created successfully',
                data: boundaryPoints
            });
        } catch (error) {
            console.error('Error in createBoundaryPoints:', {
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                status: 'error',
                message: 'Failed to create boundary points',
                error: error.message
            });
        }
    }

    // Get boundary points for a site
    async getBoundariesBySiteId(req, res) {
        try {
            const  siteId  = req.params.miningSiteId;
            console.log('Fetching boundary points for site:', { siteId });

            const boundaries = await MinableBoundaryService.getBoundariesBySiteId(siteId);

            console.log('Successfully retrieved boundary points:', {
                siteId,
                pointsCount: boundaries.length
            });

            return res.status(200).json({
                status: 'success',
                data: boundaries
            });
        } catch (error) {
            console.error('Error in getBoundariesBySiteId:', {
                siteId: req.params.siteId,
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                status: 'error',
                message: 'Failed to retrieve boundary points',
                error: error.message
            });
        }
    }

    // Update boundary points
    async updateBoundaryPoints(req, res) {
        try {
            const  siteId  = req.params.miningSiteId;
            console.log('Attempting to update boundary points:', {
                siteId,
                updatedPointsCount: req.body.boundaries?.length
            });

            const updatedBoundaries = await MinableBoundaryService.updateBoundaryPoints(
                siteId,
                req.body.boundaries,
                req.userId
            );

            console.log('Successfully updated boundary points:', {
                siteId,
                updatedCount: updatedBoundaries.length
            });

            return res.status(200).json({
                status: 'success',
                message: 'Boundary points updated successfully',
                data: updatedBoundaries
            });
        } catch (error) {
            console.error('Error in updateBoundaryPoints:', {
                siteId: req.params.siteId,
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                status: 'error',
                message: 'Failed to update boundary points',
                error: error.message
            });
        }
    }

    // Delete boundary points
    async deleteBoundaryPoints(req, res) {
        try {
            const siteId  = req.params.miningSiteId;
            console.log('Attempting to delete boundary points:', { siteId });

            await MinableBoundaryService.deleteBoundaryPoints(siteId);

            console.log('Successfully deleted boundary points:', { siteId });

            return res.status(200).json({
                status: 'success',
                message: 'Boundary points deleted successfully'
            });
        } catch (error) {
            console.error('Error in deleteBoundaryPoints:', {
                siteId: req.params.siteId,
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                status: 'error',
                message: 'Failed to delete boundary points',
                error: error.message
            });
        }
    }

    // Validate boundary points
    async validateBoundaryPoints(req, res) {
        try {
            const { boundaries } = req.body;
            console.log('Validating boundary points:', {
                pointsCount: boundaries?.length
            });

            const validationResult = await MinableBoundaryService.validateBoundaryPoints(boundaries);

            console.log('Boundary validation complete:', {
                isValid: validationResult.isValid,
                pointsValidated: boundaries?.length
            });

            return res.status(200).json({
                status: 'success',
                data: validationResult
            });
        } catch (error) {
            console.error('Error in validateBoundaryPoints:', {
                error: error.message,
                stack: error.stack
            });

            return res.status(500).json({
                status: 'error',
                message: 'Failed to validate boundary points',
                error: error.message
            });
        }
    }
}

module.exports = new MinableBoundaryController();