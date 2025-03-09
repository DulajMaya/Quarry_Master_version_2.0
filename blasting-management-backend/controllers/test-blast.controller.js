// controllers/test-blast.controller.js
const testBlastService = require('../services/test-blast.service');
const { 
    validateTestBlastDetails, 
    validateTestBlast,
    validateTestBlastHole,
    validateBlastApproval 
} = require('../utils/validateInput-testblast');
const { uploadFile } = require('../middleware/upload');
const { formatResponse, errorResponse,ResponseUtil } = require('../utils/response');

class TestBlastController {
    async createTestBlastDetails(req, res) {
        try {
            // Validate input
            const validation = validateTestBlastDetails(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const testBlastDetails = await testBlastService.createTestBlastDetails(req.body);
            return res.status(201).json({
                success: true,
                data: testBlastDetails
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async createTestBlast(req, res) {
        try {
            // Validate input
            const validation = validateTestBlast(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const testBlastData = {
                ...req.body,
                holes_sketch_url: req.file ? req.file.path : null
            };

            const testBlast = await testBlastService.createTestBlast(testBlastData);
            return res.status(201).json({
                success: true,
                data: testBlast
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getTestBlastDetailsById(req, res) {
        try {
            const { id } = req.params;
            const testBlastDetails = await testBlastService.getTestBlastDetailsById(id);
            
            if (!testBlastDetails) {
                return errorResponse(res, 404, 'Test blast details not found');
            }

            return formatResponse(res, 200, 'Test blast details retrieved successfully', testBlastDetails);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
    //new
    async getAllTestBlastDetails(req, res) {
        try {
            console.log('hi')
            const testBlastDetails = await testBlastService.getAllTestBlastDetails();
            
            if (!testBlastDetails || testBlastDetails.length === 0) {
                return errorResponse(res, 404, 'No test blast details found');
            }
    
            return formatResponse(res, 200, 'Test blast details retrieved successfully', testBlastDetails);
        } catch (error) {
            console.log(error);
            return errorResponse(res, 500, error.message);
        }
    }
    

    async updateTestBlastApproval(req, res) {
        try {
            const { id } = req.params;
            const validationRules = {
                is_approved: { type: 'boolean', required: true },
                comments: { type: 'string', required: false }
            };

            const validatedData = validateBlastApproval(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors);
            }

            const updatedDetails = await testBlastService.updateTestBlastApproval(id, req.body);
            return formatResponse(res, 200, 'Test blast approval updated successfully', updatedDetails);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getTestBlastsByLicense(req, res) {
        try {
            const { licenseId } = req.params;
            const testBlasts = await testBlastService.getTestBlastsByLicense(licenseId);
            return formatResponse(res, 200, 'Test blasts retrieved successfully', testBlasts);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getTestBlastById(req, res) {
        try {
            const { blastId } = req.params;
            const result = await testBlastService.getTestBlastById(blastId);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getTestBlastsBySite(req, res) {
        try {
            const { siteId } = req.params;
            const testBlasts = await testBlastService.getTestBlastsBySite(siteId);
            return formatResponse(res, 200, 'Test blasts retrieved successfully', testBlasts);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async createTestBlastHole(req, res) {
        try {
            const validationRules = {
                test_blast_id: { type: 'number', required: true },
                water_gel_use: { type: 'number', required: true, min: 0 },
                anfo_use: { type: 'number', required: true, min: 0 },
                ed_delay_number: { type: 'number', required: true , min: 0 },
                diameter: { type: 'number', required: true, min: 0 },
                depth: { type: 'number', required: true, min: 0 },
                bench_height: { type: 'number', required: true, min: 0 },
                stemming_height: { type: 'number', required: true, min: 0 }
            };

            const validatedData = validateTestBlastHole(req.body, validationRules);
            if (!validatedData.isValid) {
                return errorResponse(res, 400, 'Validation failed', validatedData.errors), console.log(validatedData.errors);
            }

            const testBlastHole = await testBlastService.createTestBlastHole(req.body);
            return formatResponse(res, 201, 'Test blast hole created successfully', testBlastHole);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async getTestBlastMonitoring(req, res) {
        try {
            const { blastId } = req.params;
            const monitoring = await testBlastService.getTestBlastMonitoring(blastId);
            return formatResponse(res, 200, 'Monitoring data retrieved successfully', monitoring);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }

    async downloadBlastSketch(req, res) {
        try {
            const { blastId } = req.params;
            const blast = await testBlastService.getTestBlastById(blastId);
            
            if (!blast || !blast.holes_sketch_url) {
                return errorResponse(res, 404, 'Blast sketch not found');
            }

            res.download(blast.holes_sketch_url);
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
}

module.exports = new TestBlastController();