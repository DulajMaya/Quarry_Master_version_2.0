
// controllers/blast-hole.controller.js
/*const blastHoleService = require('../services/blast-hole.service');

class BlastHoleController {
    async createBatchHoles(req, res) {
        try {
            console.log('Create batch holes request:', {
                blastId: req.body.blast_id,
                holesCount: req.body.holes?.length
            });

            // Validate basic request structure
            if (!req.body.blast_id || !req.body.holes || !Array.isArray(req.body.holes)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid request: blast_id and holes array required'
                });
            }

            // Validate each hole data
            for (const [index, hole] of req.body.holes.entries()) {
                if (!this.validateHoleData(hole)) {
                    return res.status(400).json({
                        status: 'error',
                        message: `Invalid hole data at index ${index}`,
                        hole: hole.hole_number || index
                    });
                }
            }

            const result = await blastHoleService.createBatchHoles({
                blastId: req.body.blast_id,
                holes: req.body.holes,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: `Successfully created ${req.body.holes.length} blast holes`,
                data: result
            });

        } catch (error) {
            console.error('Error in createBatchHoles controller:', error);
            const statusCode = this.determineStatusCode(error);
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

   async validateHoleData(hole) {
        // Check required fields
        if (!hole.hole_number || !hole.drill_hole_id || !hole.explosives) {
            return false;
        }

        // Validate explosives array
        if (!Array.isArray(hole.explosives) || hole.explosives.length === 0) {
            return false;
        }

        // Validate each explosive entry
        return hole.explosives.every(exp => 
            exp.explosive_type_id && 
            typeof exp.quantity === 'number' && 
            exp.quantity > 0
        );
    }

    async getBlastHoles(req, res) {
        try {
            console.log('Get blast holes request:', {
                blastId: req.params.blast_id
            });

            const holes = await blastHoleService.getBlastHoles(
                req.params.blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: holes
            });

        } catch (error) {
            console.error('Error in getBlastHoles controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateHoleStatus(req, res) {
        try {
            console.log('Update hole status request:', {
                holeId: req.params.hole_id,
                newStatus: req.body.status
            });

            if (!req.body.status) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Status is required'
                });
            }

            const result = await blastHoleService.updateHoleStatus(
                req.params.hole_id,
                req.body.status,
                req.body.remarks,
                req.userId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Hole status updated successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in updateHoleStatus controller:', error);
            const statusCode = 
                error.message.includes('Invalid status') ? 400 :
                error.message.includes('not found') ? 404 : 500;
                
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async updateHoleExplosives(req, res) {
        try {
            console.log('Update hole explosives request:', {
                holeId: req.params.hole_id,
                explosivesCount: req.body.explosives?.length
            });

            if (!req.body.explosives || !Array.isArray(req.body.explosives)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Valid explosives array required'
                });
            }

            // Validate explosives data
            const invalidExplosives = req.body.explosives.filter(exp => 
                !exp.explosive_type_id || 
                typeof exp.quantity !== 'number' || 
                exp.quantity <= 0
            );

            if (invalidExplosives.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid explosive data provided',
                    invalidEntries: invalidExplosives
                });
            }

            const result = await blastHoleService.updateHoleExplosives(
                req.params.hole_id,
                req.body.explosives,
                req.userId
            );

            return res.status(200).json({
                status: 'success',
                message: 'Hole explosives updated successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in updateHoleExplosives controller:', error);
            const statusCode = this.determineStatusCode(error);
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getHoleDetails(req, res) {
        try {
            console.log('Get hole details request:', {
                holeId: req.params.hole_id
            });

            const details = await blastHoleService.getHoleDetails(
                req.params.hole_id
            );

            return res.status(200).json({
                status: 'success',
                data: details
            });

        } catch (error) {
            console.error('Error in getHoleDetails controller:', error);
            const statusCode = error.message.includes('not found') ? 404 : 500;
            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async determineStatusCode(error) {
        if (error.message.includes('not found')) return 404;
        if (error.message.includes('insufficient')) return 400;
        if (error.message.includes('Invalid')) return 400;
        if (error.message.includes('status')) return 400;
        return 500;
    }
}

module.exports = new BlastHoleController();*/


const blastHoleService = require('../services/blast-hole.service');

// Utility functions
const validateHoleData = (hole) => {
    // Check required fields
    if (!hole.hole_number || !hole.drill_hole_id || !hole.explosives) {
        return false;
    }

    // Validate explosives array
    if (!Array.isArray(hole.explosives) || hole.explosives.length === 0) {
        return false;
    }

    // Validate each explosive entry
    return hole.explosives.every(exp => 
        exp.explosive_type_id && 
        typeof exp.quantity === 'number' && 
        exp.quantity > 0
    );
};

const determineStatusCode = (error) => {
    if (error.message.includes('not found')) return 404;
    if (error.message.includes('insufficient')) return 400;
    if (error.message.includes('Invalid')) return 400;
    if (error.message.includes('status')) return 400;
    return 500;
};

// Controller functions
const createBatchHoles = async (req, res) => {
    try {
        console.log('Create batch holes request:', {
            blastId: req.body.blast_id,
            holesCount: req.body.holes?.length
        });

        // Validate basic request structure
        if (!req.body.blast_id || !req.body.holes || !Array.isArray(req.body.holes)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request: blast_id and holes array required'
            });
        }

        // Validate each hole data
        for (const [index, hole] of req.body.holes.entries()) {
            if (!validateHoleData(hole)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid hole data at index ${index}`,
                    hole: hole.hole_number || index
                });
            }
        }

        const result = await blastHoleService.createBatchHoles({
            blastId: req.body.blast_id,
            holes: req.body.holes,
            userId: req.userId
        });

        return res.status(201).json({
            status: 'success',
            message: `Successfully created ${req.body.holes.length} blast holes`,
            data: result
        });

    } catch (error) {
        console.error('Error in createBatchHoles controller:', error);
        const statusCode = determineStatusCode(error);
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

const getBlastHoles = async (req, res) => {
    try {
        console.log('Get blast holes request:', {
            blastId: req.params.blast_id
        });

        const holes = await blastHoleService.getBlastHoles(
            req.params.blast_id
        );

        return res.status(200).json({
            status: 'success',
            data: holes
        });

    } catch (error) {
        console.error('Error in getBlastHoles controller:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

const updateHoleStatus = async (req, res) => {
    try {
        console.log('Update hole status request:', {
            holeId: req.params.hole_id,
            newStatus: req.body.status
        });

        if (!req.body.status) {
            return res.status(400).json({
                status: 'error',
                message: 'Status is required'
            });
        }

        const result = await blastHoleService.updateHoleStatus(
            req.params.hole_id,
            req.body.status,
            req.body.remarks,
            req.userId
        );

        return res.status(200).json({
            status: 'success',
            message: 'Hole status updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error in updateHoleStatus controller:', error);
        const statusCode = 
            error.message.includes('Invalid status') ? 400 :
            error.message.includes('not found') ? 404 : 500;
            
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

const updateHoleExplosives = async (req, res) => {
    try {
        console.log('Update hole explosives request:', {
            holeId: req.params.hole_id,
            explosivesCount: req.body.explosives?.length
        });

        if (!req.body.explosives || !Array.isArray(req.body.explosives)) {
            return res.status(400).json({
                status: 'error',
                message: 'Valid explosives array required'
            });
        }

        // Validate explosives data
        const invalidExplosives = req.body.explosives.filter(exp => 
            !exp.explosive_type_id || 
            typeof exp.quantity !== 'number' || 
            exp.quantity <= 0
        );

        if (invalidExplosives.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid explosive data provided',
                invalidEntries: invalidExplosives
            });
        }

        const result = await blastHoleService.updateHoleExplosives(
            req.params.hole_id,
            req.body.explosives,
            req.userId
        );

        return res.status(200).json({
            status: 'success',
            message: 'Hole explosives updated successfully',
            data: result
        });

    } catch (error) {
        console.error('Error in updateHoleExplosives controller:', error);
        const statusCode = determineStatusCode(error);
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

const getHoleDetails = async (req, res) => {
    try {
        console.log('Get hole details request:', {
            holeId: req.params.hole_id
        });

        const details = await blastHoleService.getHoleDetails(
            req.params.hole_id
        );

        return res.status(200).json({
            status: 'success',
            data: details
        });

    } catch (error) {
        console.error('Error in getHoleDetails controller:', error);
        const statusCode = error.message.includes('not found') ? 404 : 500;
        return res.status(statusCode).json({
            status: 'error',
            message: error.message
        });
    }
};

module.exports = {
    createBatchHoles,
    getBlastHoles,
    updateHoleStatus,
    updateHoleExplosives,
    getHoleDetails
};