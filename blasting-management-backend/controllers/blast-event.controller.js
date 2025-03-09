// controllers/blast-event.controller.js
/*const blastEventService = require('../services/blast-event.service');
const fileUploadService = require('../services/fileUpload.service');

class BlastEventController {
    async createBlastEvent(req, res) {
        try {
            console.log('Create blast event request received:', {
                dailyBlastId: req.body.daily_blast_id,
                drillingSiteId: req.body.drilling_site_id,
                userId: req.userId
            });

            const blastEvent = await blastEventService.createBlastEvent({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Blast event created successfully',
                data: blastEvent
            });
        } catch (error) {
            console.error('Error in createBlastEvent controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('Insufficient quantity') ? 400 :
                500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getBlastEvents(req, res) {
        try {
            console.log('Get blast events request received:', {
                dailyBlastId: req.params.daily_blast_id,
                query: req.query
            });

            const result = await blastEventService.getBlastEvents(
                req.params.daily_blast_id,
                req.query
            );

            return res.status(200).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in getBlastEvents controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error retrieving blast events'
            });
        }
    }

    async updateBlastEvent(req, res) {
        try {
            console.log('Update blast event request received:', {
                blastId: req.params.blast_id,
                updates: Object.keys(req.body)
            });

            const blastEvent = await blastEventService.updateBlastEvent(
                req.params.blast_id,
                req.body
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast event updated successfully',
                data: blastEvent
            });
        } catch (error) {
            console.error('Error in updateBlastEvent controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('status transition') ? 400 :
                error.message.includes('quantity exceeds') ? 400 :
                500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async completeBlastEvent(req, res) {
        try {
            console.log('Complete blast event request received:', {
                blastId: req.params.blast_id
            });

            const blastEvent = await blastEventService.completeBlastEvent(
                req.params.blast_id
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast event completed successfully',
                data: blastEvent
            });
        } catch (error) {
            console.error('Error in completeBlastEvent controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('must be in CHARGING status') ? 400 :
                error.message.includes('must be recorded') ? 400 :
                500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async uploadBlastPattern(req, res) {
        try {
            console.log('Upload blast pattern request received:', {
                blastId: req.params.blast_id,
                file: req.file?.originalname
            });

            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }

            const uploadedFile = await fileUploadService.uploadBlastPattern(req.file);
            const blastEvent = await blastEventService.uploadBlastPattern(
                req.params.blast_id,
                uploadedFile
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast pattern uploaded successfully',
                data: {
                    pattern_sketch_url: blastEvent.pattern_sketch_url
                }
            });
        } catch (error) {
            console.error('Error in uploadBlastPattern controller:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error uploading blast pattern'
            });
        }
    }

    async getBlastSummary(req, res) {
        try {
            console.log('Get blast summary request received:', {
                blastId: req.params.blast_id
            });

            const summary = await blastEventService.getBlastSummary(
                req.params.blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: summary
            });
        } catch (error) {
            console.error('Error in getBlastSummary controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async cancelBlastEvent(req, res) {
        try {
            console.log('Cancel blast event request received:', {
                blastId: req.params.blast_id,
                reason: req.body.reason
            });

            const blastEvent = await blastEventService.updateBlastEvent(
                req.params.blast_id,
                {
                    status: 'CANCELLED',
                    remarks: req.body.reason
                }
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast event cancelled successfully',
                data: blastEvent
            });
        } catch (error) {
            console.error('Error in cancelBlastEvent controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('status transition') ? 400 :
                500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new BlastEventController();*/


// controllers/blast-event.controller.js
const blastEventService = require('../services/blast-event.service');
const fs = require('fs');

class BlastEventController {
    /*async createBlastEvent(req, res) {
        try {
            console.log('Create blast event request:', {
                dailyBlastId: req.body.daily_blast_id,
                drillingSiteId: req.body.drilling_site_id
            });

            // Validate required fields
            if (!req.body.daily_blast_id || !req.body.drilling_site_id) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Required fields missing: daily_blast_id, drilling_site_id'
                });
            }

            const blastEvent = await blastEventService.createBlastEvent({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Blast event created successfully',
                data: blastEvent
            });

        } catch (error) {
            console.error('Error in createBlastEvent controller:', error);
            const statusCode = 
                error.message.includes('not found') ? 404 :
                error.message.includes('limit exceeded') ? 400 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }*/

        async createBlastEvent(req, res) {
            try {
                console.log('Create blast event request:', {
                    dailyBlastId: req.body.daily_blast_id,
                    drillingSiteId: req.body.drilling_site_id,
                    hasDelayPattern: !!req.file
                });
        
                // Validate required fields
                if (!req.body.daily_blast_id || !req.body.drilling_site_id) {
                    // Remove uploaded file if exists since validation failed
                    if (req.file) {
                        fs.unlinkSync(req.file.path);
                    }
                    return res.status(400).json({
                        status: 'error',
                        message: 'Required fields missing: daily_blast_id, drilling_site_id'
                    });
                }
        
                const blastEvent = await blastEventService.createBlastEvent({
                    ...req.body,
                    delayPatternFile: req.file,  // Pass the uploaded file to service
                    userId: req.userId
                });
        
                return res.status(201).json({
                    status: 'success',
                    message: 'Blast event created successfully',
                    data: blastEvent
                });
        
            } catch (error) {
                console.error('Error in createBlastEvent controller:', error);
                // Clean up uploaded file if exists
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }
                
                const statusCode = 
                    error.message.includes('not found') ? 404 :
                    error.message.includes('limit exceeded') ? 400 : 500;
        
                return res.status(statusCode).json({
                    status: 'error',
                    message: error.message
                });
            }
        }



    
    async getBlastEvents(req, res) {
        try {
            console.log('Get blast events request:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const events = await blastEventService.getBlastEvents(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: events
            });

        } catch (error) {
            console.error('Error in getBlastEvents controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async createBlastHoles(req, res) {
        try {
            console.log('Create blast holes request:', {
                blastId: req.params.blast_id,
                holesCount: req.body.holes?.length
            });

            // Validate holes data
            if (!req.body.holes || !Array.isArray(req.body.holes) || req.body.holes.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Valid holes array is required'
                });
            }

            // Validate each hole's data structure
            const invalidHoles = req.body.holes.filter(hole => 
                !hole.drill_hole_id ||
                !hole.hole_number ||
                !hole.explosives ||
                !Array.isArray(hole.explosives)
            );

            if (invalidHoles.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid hole data structure',
                    invalidHoles: invalidHoles.map(h => h.hole_number)
                });
            }

            // Validate each explosive entry
            const invalidExplosives = req.body.holes.some(hole => 
                hole.explosives.some(exp => 
                    !exp.explosive_type_id || 
                    typeof exp.quantity === 'undefined'
                )
            );

            if (invalidExplosives) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid explosive data in holes'
                });
            }

            const result = await blastEventService.createBlastHoles(
                req.params.blast_id,
                req.body.holes,
                req.userId
            );

            return res.status(201).json({
                status: 'success',
                message: 'Blast holes and explosives recorded successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in createBlastHoles controller:', error);
            const statusCode = 
                error.message.includes('insufficient explosives') ? 400 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getExplosiveUsage(req, res) {
        try {
            console.log('Get explosive usage request:', {
                blastId: req.params.blast_id
            });

            const usage = await blastEventService.getExplosiveUsage(
                req.params.blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: usage
            });

        } catch (error) {
            console.error('Error in getExplosiveUsage controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateStatus(req, res) {
        try {
            console.log('Update blast status request:', {
                blastId: req.params.blast_id,
                newStatus: req.body.status
            });

            if (!req.body.status) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Status is required'
                });
            }

            const result = await blastEventService.updateStatus(
                req.params.blast_id,
                req.body.status,
                req.userId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast status updated successfully',
                data: result
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

    /*async completeBlastEvent(req, res) {
        try {
            console.log('Complete blast event request:', {
                blastId: req.params.blast_id,
                results: req.body
            });

            // Validate blast results data
            if (!req.body.fragmentation_quality || !req.body.muckpile_shape) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Required blast result fields missing'
                });
            }

            const result = await blastEventService.completeBlastEvent(
                req.params.blast_id,
                req.body,
                req.userId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Blast event completed successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in completeBlastEvent controller:', error);
            const statusCode = 
                error.message.includes('incomplete holes') ? 400 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }*/


    // In blast-event.controller.js
async completeBlastEvent(req, res) {
    try {
        const requiredFields = ['fragmentation_quality', 'muckpile_shape'];
        const validFragmentationQualities = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

        if (requiredFields.some(field => !req.body[field])) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: fragmentation_quality, muckpile_shape'
            });
        }

        if (!validFragmentationQualities.includes(req.body.fragmentation_quality)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid fragmentation_quality'
            });
        }

        const result = await blastEventService.completeBlastEvent(
            req.params.blast_id,
            req.body,
            req.userId
        );

        return res.status(200).json({
            status: 'success',
            message: 'Blast event completed successfully',
            data: result
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

    async uploadPatternSketch(req, res) {
        try {
            console.log('Upload pattern sketch request:', {
                blastId: req.params.blast_id,
                file: req.file
            });
    
            if (!req.file) {
                return res.status(400).json({
                    status: 'error',
                    message: 'No file uploaded'
                });
            }
    
            const result = await blastEventService.updatePatternSketch(
                req.params.blast_id,
                req.file,
                req.userId
            );
    
            return res.status(200).json({
                status: 'success',
                message: 'Pattern sketch uploaded successfully',
                data: {
                    pattern_sketch_url: result.pattern_sketch_url
                }
            });
    
        } catch (error) {
            console.error('Error in uploadPatternSketch controller:', error);
            // Delete uploaded file if exists and error occurs
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            
            const statusCode = error.message.includes('not found') ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }


    async getCompletionSummary(req, res) {
        try {
            const summary = await blastEventService.getBlastCompletionSummary(req.params.blast_id);
     
            return res.status(200).json({
                status: 'success',
                data: {
                    summary,
                    alerts: {
                        hasMisfires: summary.holes.misfired > 0,
                        hasFlyrock: summary.results.safety.flyrock,
                        hasSignificantBackbreak: summary.results.safety.backBreak > 1.0
                    }
                }
            });
     
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
     }



}

module.exports = new BlastEventController();


