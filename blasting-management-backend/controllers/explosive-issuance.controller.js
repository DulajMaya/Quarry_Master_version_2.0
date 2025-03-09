// controllers/explosive-issuance.controller.js
const explosiveIssuanceService = require('../services/explosive-issuance.service');

class ExplosiveIssuanceController {
    async createIssuance(req, res) {
        try {
            console.log('Create explosive issuance request received:', {
                dailyBlastId: req.body.daily_blast_id,
                storeId: req.body.store_id,
                items: req.body.items?.length
            });

            // Validate request body
            if (!req.body.daily_blast_id || !req.body.store_id || !req.body.items?.length) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Required fields missing: daily_blast_id, store_id, items'
                });
            }

            // Validate items structure
            const invalidItems = req.body.items.filter(item => 
                !item.explosive_type_id || 
                !item.quantity_issued || 
                !item.inventory_id ||
                !item.batch_number
            );

            if (invalidItems.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid items data. Each item must have explosive_type_id, quantity_issued, inventory_id, and batch_number'
                });
            }

            const issuance = await explosiveIssuanceService.createIssuance({
                ...req.body,
                userId: req.userId
            });

            return res.status(201).json({
                status: 'success',
                message: 'Explosive issuance created successfully',
                data: issuance
            });

        } catch (error) {
            console.error('Error in createIssuance controller:', error);
            const statusCode = 
                error.message.includes('insufficient stock') ? 400 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getIssuanceDetails(req, res) {
        try {
            console.log('Get issuance details request received:', {
                issuanceId: req.params.issuance_id
            });

            const issuance = await explosiveIssuanceService.getIssuanceDetails(
                req.params.issuance_id
            );

            if (!issuance) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Explosive issuance not found'
                });
            }

            return res.status(200).json({
                status: 'success',
                data: issuance
            });

        } catch (error) {
            console.error('Error in getIssuanceDetails controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    /*async recordReturn(req, res) {
        try {
            console.log('Record explosive return request received:', {
                issuanceId: req.params.issuance_id,
                items: req.body.items?.length
            });

            // Validate request body
            if (!req.body.items?.length) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Items array is required'
                });
            }

            // Validate items structure
            const invalidItems = req.body.items.filter(item => 
                !item.explosive_type_id || 
                (typeof item.quantity_returned === 'undefined' &&
                typeof item.quantity_damaged === 'undefined' &&
                typeof item.quantity_wasted === 'undefined')
            );

            if (invalidItems.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid items data. Each item must have explosive_type_id and at least one quantity field'
                });
            }

            // Calculate unbalanced quantities first
            const unbalancedData = await explosiveIssuanceService.calculateUnbalancedQuantities(
                req.params.issuance_id
            );

            // Check if quantities match
            for (const returnItem of req.body.items) {
                const unbalancedItem = unbalancedData.find(
                    item => item.explosive_type_id === returnItem.explosive_type_id
                );

                if (!unbalancedItem) {
                    return res.status(400).json({
                        status: 'error',
                        message: `Invalid explosive type: ${returnItem.explosive_type_id}`
                    });
                }

                const totalReturned = parseFloat(returnItem.quantity_returned || 0);
                const totalDamaged = parseFloat(returnItem.quantity_damaged || 0);
                const totalWasted = parseFloat(returnItem.quantity_wasted || 0);
                const totalAccounted = unbalancedItem.quantity_used + totalReturned + totalDamaged + totalWasted;

                if (Math.abs(totalAccounted - unbalancedItem.quantity_issued) > 0.01) {
                    return res.status(400).json({
                        status: 'error',
                        message: `Quantities don't match for ${unbalancedItem.explosive_type_name}`,
                        details: {
                            issued: unbalancedItem.quantity_issued,
                            used: unbalancedItem.quantity_used,
                            returned: totalReturned,
                            damaged: totalDamaged,
                            wasted: totalWasted,
                            difference: unbalancedItem.quantity_issued - totalAccounted
                        }
                    });
                }
            }

            const result = await explosiveIssuanceService.recordReturn({
                issuanceId: req.params.issuance_id,
                items: req.body.items,
                userId: req.userId
            });

            return res.status(200).json({
                status: 'success',
                message: 'Explosive returns recorded successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in recordReturn controller:', error);
            const statusCode = 
                error.message.includes('quantities') ? 400 :
                error.message.includes('not found') ? 404 : 500;

            return res.status(statusCode).json({
                status: 'error',
                message: error.message
            });
        }
    }*/


        async recordReturn(req, res) {
            try {
                console.log('Record return request:', {
                    issuanceId: req.params.issuance_id,
                    items: req.body.items?.length
                });
         
                // Validate request body
                if (!req.body.items?.length) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Items array is required'
                    });
                }
         
                // Validate each item has required fields
                const invalidItems = req.body.items.filter(item => 
                    !item.explosive_type_id || 
                    (!item.quantity_returned && 
                     !item.quantity_damaged && 
                     !item.quantity_wasted)
                );
         
                if (invalidItems.length > 0) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Each item must have explosive_type_id and at least one quantity field'
                    });
                }
         
                const result = await explosiveIssuanceService.recordReturn(
                    req.params.issuance_id,
                    {
                        ...req.body,
                        userId: req.userId
                    }
                );
         
                return res.status(200).json({
                    status: 'success',
                    message: 'Return recorded successfully',
                    data: result
                });
         
            } catch (error) {
                console.error('Error in recordReturn:', error);
                const statusCode = 
                    error.message.includes('Invalid return') ? 400 :
                    error.message.includes('not found') ? 404 : 500;
         
                return res.status(statusCode).json({
                    status: 'error',
                    message: error.message
                });
            }
         }


    async checkUnbalancedQuantities(req, res) {
        try {
            console.log('Check unbalanced quantities request received:', {
                issuanceId: req.params.issuance_id
            });

            const unbalancedData = await explosiveIssuanceService.calculateUnbalancedQuantities(
                req.params.issuance_id
            );

            return res.status(200).json({
                status: 'success',
                data: unbalancedData
            });

        } catch (error) {
            console.error('Error in checkUnbalancedQuantities controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getDailyIssuances(req, res) {
        try {
            console.log('Get daily issuances request received:', {
                dailyBlastId: req.params.daily_blast_id
            });

            const issuances = await explosiveIssuanceService.getDailyIssuances(
                req.params.daily_blast_id
            );

            return res.status(200).json({
                status: 'success',
                data: issuances
            });

        } catch (error) {
            console.error('Error in getDailyIssuances controller:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getUsageStatus(req, res) {
        try {
            console.log('Get issuance usage status:', {
                issuanceId: req.params.issuance_id
            });
    
            const usageData = await explosiveIssuanceService.getIssuanceUsageStatus(
                req.params.issuance_id
            );
    
            return res.status(200).json({
                status: 'success',
                data: usageData
            });
    
        } catch (error) {
            console.error('Error in getUsageStatus:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getReturnPreview(req, res) {
        try {
            const preview = await explosiveIssuanceService.generateReturnPreview(req.params.issuance_id);
            return res.status(200).json({ status: 'success', data: preview });
        } catch (error) {
            console.error('Error in getReturnPreview:', error);
            return res.status(500).json({ status: 'error', message: error.message });
        }
    }






}

module.exports = new ExplosiveIssuanceController();