// controllers/blast-result.controller.js
const blastResultService = require('../services/blast-result.service');
const fileUploadService = require('../services/fileUpload.service');

class BlastResultController {
    async createBlastResult(req, res) {
        try {
            console.log('Create blast result request received:', {
                blastId: req.body.blast_id,
                fragmentation: req.body.fragmentation_quality
            });

            // Handle file uploads if present
            let photos = [];
            if (req.files && req.files.length > 0) {
                photos = await Promise.all(req.files.map(file => 
                    fileUploadService.uploadBlastResultPhoto(file)
                ));
            }

            const result = await blastResultService.createBlastResult({
                ...req.body,
                photos,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Blast result recorded successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in createBlastResult controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('already exists') ? 409 :
                error.message.includes('uncompleted blast') ? 400 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateBlastResult(req, res) {
        try {
            console.log('Update blast result request received:', {
                resultId: req.params.result_id
            });

            // Handle new photos if any
            if (req.files && req.files.length > 0) {
                const newPhotos = await Promise.all(req.files.map(file => 
                    fileUploadService.uploadBlastResultPhoto(file)
                ));
                req.body.photos = newPhotos;
            }

            const result = await blastResultService.updateBlastResult(
                req.params.result_id,
                req.body
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast result updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error in updateBlastResult controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getBlastResult(req, res) {
        try {
            console.log('Get blast result request received:', {
                blastId: req.params.blast_id
            });

            const result = await blastResultService.getBlastResult(
                req.params.blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in getBlastResult controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getBlastResults(req, res) {
        try {
            console.log('Get blast results request received:', {
                miningSiteId: req.params.miningSiteId,
                query: req.query
            });

            const results = await blastResultService.getBlastResults(
                req.params.miningSiteId,
                req.query
            );

            return res.status(200).json({
                status: 'success',
                data: results
            });
        } catch (error) {
            console.error('Error in getBlastResults controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving blast results'
            });
        }
    }

    async generateSummaryReport(req, res) {
        try {
            console.log('Generate summary report request received:', {
                miningSiteId: req.params.miningSiteId,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            });

            const summary = await blastResultService.generateSummaryReport(
                req.params.miningSiteId,
                req.query.startDate,
                req.query.endDate
            );

            return res.status(200).json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            console.error('Error in generateSummaryReport controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error generating summary report'
            });
        }
    }
}

module.exports = new BlastResultController();