// services/drill-hole.service.js
const { DrillHole, DrillingPattern, DrillingSite, MiningSite } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class DrillHoleService {
    async createDrillHoles(data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting drill holes creation:', {
                patternId: data.pattern_id,
                numberOfHoles: data.holes?.length || 0
            });

            // Get pattern to validate
            const pattern = await DrillingPattern.findByPk(data.pattern_id);
            if (!pattern) {
                throw new Error('Drilling pattern not found');
            }

            // Generate holes based on pattern
            const holes = data.holes.map(hole => ({
                ...hole,
                pattern_id: data.pattern_id,
                drilling_site_id: pattern.drilling_site_id,
                created_by: data.userId
            }));

            // Validate hole numbers
            if (holes.length > pattern.total_holes) {
                throw new Error(`Cannot create more than ${pattern.total_holes} holes for this pattern`);
            }

            // Create holes
            const createdHoles = await DrillHole.bulkCreate(holes, { 
                transaction,
                validate: true
            });

            await transaction.commit();
            console.log('Successfully created drill holes:', {
                count: createdHoles.length,
                patternId: data.pattern_id
            });

            return createdHoles;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in createDrillHoles:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getDrillHoles(pattern_id, query = {}) {
        try {
            console.log('Fetching drill holes:', { pattern_id, query });

            const {
                page = 1,
                limit = 10,
                status,
                search,
                sortBy = 'row_number',
                sortOrder = 'ASC'
            } = query;

            const where = { 
                pattern_id,
                is_active: true 
            };

            if (status) {
                where.status = status;
            }

            if (search) {
                where[Op.or] = [
                    { hole_number: { [Op.like]: `%${search}%` } },
                    { remarks: { [Op.like]: `%${search}%` } }
                ];
            }

            const holes = await DrillHole.findAndCountAll({
                where,
                include: [{
                    model: DrillingPattern,
                    as: 'drillingPattern',
                    include: [{
                        model: DrillingSite,
                        as: 'drillingSite',
                        include: [{
                            model: MiningSite,
                            as: 'miningSite'
                        }]
                    }]
                }],
                order: [[sortBy, sortOrder]],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            // Calculate statistics
            const statistics = await this.calculateHoleStatistics(pattern_id);

            return {
                total: holes.count,
                pages: Math.ceil(holes.count / limit),
                currentPage: parseInt(page),
                holes: holes.rows,
                statistics
            };
        } catch (error) {
            console.error('Error in getDrillHoles:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async calculateHoleStatistics(pattern_id) {
        try {
            const stats = await DrillHole.findAll({
                where: { pattern_id, is_active: true },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('hole_id')), 'totalHoles'],
                    [sequelize.fn('SUM', 
                        sequelize.literal('CASE WHEN status = \'DRILLED\' THEN 1 ELSE 0 END')), 
                    'drilledHoles'],
                    [sequelize.fn('AVG', 
                        sequelize.literal('CASE WHEN actual_depth IS NOT NULL THEN actual_depth ELSE NULL END')), 
                    'averageDepth'],
                    [sequelize.fn('COUNT', 
                        sequelize.literal('CASE WHEN water_condition IS NOT NULL THEN 1 ELSE NULL END')), 
                    'wetHoles']
                ]
            });

            return stats[0];
        } catch (error) {
            console.error('Error calculating hole statistics:', error);
            throw error;
        }
    }

    async updateDrillHole(hole_id, data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting drill hole update:', { hole_id });

            const hole = await DrillHole.findOne({
                where: { 
                    hole_id,
                    is_active: true 
                }
            });

            if (!hole) {
                throw new Error('Drill hole not found');
            }

            // Validate status transition
            if (data.status && !this.isValidStatusTransition(hole.status, data.status)) {
                throw new Error(`Invalid status transition from ${hole.status} to ${data.status}`);
            }

            await hole.update(data, { transaction });

            // If marking as drilled, validate actual measurements
            if (data.status === 'DRILLED') {
                if (!data.actual_depth || !data.actual_diameter) {
                    throw new Error('Actual depth and diameter required when marking hole as drilled');
                }
            }

            await transaction.commit();
            return hole;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateDrillHole:', {
                hole_id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async updateDrillHoleStatus(hole_id, status, remarks = null) {
        try {
            console.log('Updating drill hole status:', { hole_id, status });

            const hole = await DrillHole.findOne({
                where: { 
                    hole_id,
                    is_active: true 
                }
            });

            if (!hole) {
                throw new Error('Drill hole not found');
            }

            if (!this.isValidStatusTransition(hole.status, status)) {
                throw new Error(`Invalid status transition from ${hole.status} to ${status}`);
            }

            await hole.update({
                status,
                remarks: remarks || hole.remarks
            });

            return hole;
        } catch (error) {
            console.error('Error in updateDrillHoleStatus:', {
                hole_id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['MARKED', 'FAILED'],
            'MARKED': ['DRILLED', 'FAILED'],
            'DRILLED': ['CHARGED', 'FAILED'],
            'CHARGED': ['BLASTED', 'FAILED']
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }

    async updateBatchStatus(pattern_id, status, hole_ids, remarks = null) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting batch status update:', {
                patternId: pattern_id,
                numberOfHoles: hole_ids.length,
                status
            });
    
            // Verify pattern exists
            const pattern = await DrillingPattern.findByPk(pattern_id);
            if (!pattern) {
                throw new Error('Pattern not found');
            }
    
            // Get all holes to update
            const holes = await DrillHole.findAll({
                where: {
                    hole_id: { [Op.in]: hole_ids },
                    pattern_id,
                    is_active: true
                }
            });
    
            // Validate all holes exist
            if (holes.length !== hole_ids.length) {
                throw new Error('Some holes not found');
            }
    
            // Validate status transitions and update holes
            const updatedHoles = await Promise.all(holes.map(async (hole) => {
                if (!this.isValidStatusTransition(hole.status, status)) {
                    throw new Error(`Invalid status transition for hole ${hole.hole_number} from ${hole.status} to ${status}`);
                }
    
                return hole.update({
                    status,
                    remarks: remarks || hole.remarks
                }, { transaction });
            }));
    
            await transaction.commit();
    
            return {
                updatedCount: updatedHoles.length,
                holes: updatedHoles
            };
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateBatchStatus:', error);
            throw error;
        }
    }
}

module.exports = new DrillHoleService();