// controllers/drilling-pattern.controller.js
const drillingPatternService = require('../services/drilling-pattern.service');

class DrillingPatternController {
    async createPattern(req, res) {
        try {
            console.log('Create pattern request received:', {
                drillingSiteId: req.body.drilling_site_id,
                userId: req.userId
            });

            const pattern = await drillingPatternService.createPattern({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Drilling pattern created successfully',
                data: pattern
            });
        } catch (error) {
            console.error('Error in createPattern controller:', error);
            const statusCode = error.message.includes('License validation') ? 400 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getPatterns(req, res) {
        try {
            const drilling_site_id = req.params.drilling_site_id;
            console.log('Get patterns request received:', {
                drilling_site_id,
                query: req.query
            });

            const result = await drillingPatternService.getPatterns(
                drilling_site_id,
                req.query
            );

            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in getPatterns controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving patterns'
            });
        }
    }

    async getPatternById(req, res) {
        try {
            const pattern_id = req.params.pattern_id;
            console.log('Get pattern by ID request received:', { pattern_id });

            const pattern = await drillingPatternService.getPatternById(pattern_id);

            return res.status(200).json({
                status: 'success',
                data: pattern
            });
        } catch (error) {
            console.error('Error in getPatternById controller:', error);
            const statusCode = error.message === 'Pattern not found' ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updatePattern(req, res) {
        try {
            const pattern_id = req.params.pattern_id;
            console.log('Update pattern request received:', { pattern_id });

            const pattern = await drillingPatternService.updatePattern(
                pattern_id,
                req.body
            );

            return res.status(200).json({
                status: 'success',
                message: 'Pattern updated successfully',
                data: pattern
            });
        } catch (error) {
            console.error('Error in updatePattern controller:', error);
            const statusCode = error.message.includes('Pattern not found') ? 404 : 
                             error.message.includes('License validation') ? 400 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async deletePattern(req, res) {
        try {
            const pattern_id = req.params.pattern_id;
            console.log('Delete pattern request received:', { pattern_id });

            await drillingPatternService.deletePattern(pattern_id);

            return res.status(200).json({
                status: 'success',
                message: 'Pattern deleted successfully'
            });
        } catch (error) {
            console.error('Error in deletePattern controller:', error);
            const statusCode = error.message === 'Pattern not found' ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    // Add to drilling-pattern.controller.js
async uploadPatternDiagram(req, res) {
    try {
        console.log('Upload pattern diagram request received:', {
            patternId: req.params.pattern_id,
            file: req.file?.originalname
        });

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No diagram file uploaded'
            });
        }

        const pattern = await drillingPatternService.uploadPatternDiagram(
            req.params.pattern_id,
            req.file
        );

        return res.status(200).json({
            status: 'success',
            message: 'Pattern diagram uploaded successfully',
            data: {
                pattern_diagram_url: pattern.pattern_diagram_url
            }
        });
    } catch (error) {
        console.error('Error in uploadPatternDiagram controller:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
}



}

module.exports = new DrillingPatternController();