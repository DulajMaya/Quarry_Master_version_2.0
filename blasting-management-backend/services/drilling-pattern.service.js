// services/drilling-pattern.service.js
const { DrillingPattern, DrillingSite, MiningSite, License } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class DrillingPatternService {
    async createPattern(data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting drilling pattern creation:', {
                drillingSiteId: data.drilling_site_id
            });

            // Get drilling site with license details for validation
            const drillingSite = await DrillingSite.findOne({
                where: { drilling_site_id: data.drilling_site_id },
                include: [{
                    model: MiningSite,
                    as: 'miningSite',
                    include: [{
                        model: License,
                        as: 'license'
                    }]
                }]
            });

            if (!drillingSite) {
                throw new Error('Drilling site not found');
            }

            const pattern = await DrillingPattern.create({
                ...data,
                created_by: data.userId
            }, { transaction });

            // Validate against license parameters
            const validationResult = await this.validatePatternAgainstLicense(pattern,drillingSite.miningSite.license);
            if (!validationResult.isValid) {
                //await transaction.rollback();
                throw new Error(`License validation failed: ${validationResult.violations.join(', ')}`);
            }

            await transaction.commit();
            console.log('Successfully created drilling pattern:', {
                patternId: pattern.pattern_id,
                drillingSiteId: pattern.drilling_site_id
            });

            return pattern;
        } catch (error) {
            if (transaction) {
                // Only rollback if transaction hasn't been rolled back already
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error('Rollback failed:', rollbackError);
                }
            }
            console.error('Error in createPattern:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getPatterns(drilling_site_id, query = {}) {
        try {
            console.log('Fetching drilling patterns:', { drilling_site_id, query });

            const {
                page = 1,
                limit = 10,
                status,
                search
            } = query;

            const where = { 
                drilling_site_id,
                is_active: true 
            };

            if (status) {
                where.status = status;
            }

            if (search) {
                where[Op.or] = [
                    { pattern_type: { [Op.like]: `%${search}%` } },
                    { remarks: { [Op.like]: `%${search}%` } }
                ];
            }

            const patterns = await DrillingPattern.findAndCountAll({
                where,
                include: [{
                    model: DrillingSite,
                    as: 'drillingSite',
                    include: [{
                        model: MiningSite,
                        as: 'miningSite'
                    }]
                }],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            console.log('Successfully retrieved patterns:', {
                count: patterns.count,
                drilling_site_id
            });

            return {
                total: patterns.count,
                pages: Math.ceil(patterns.count / limit),
                currentPage: parseInt(page),
                patterns: patterns.rows
            };
        } catch (error) {
            console.error('Error in getPatterns:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getPatternById(pattern_id) {
        try {
            console.log('Fetching pattern details:', { pattern_id });

            const pattern = await DrillingPattern.findOne({
                where: { 
                    pattern_id,
                    is_active: true 
                },
                include: [{
                    model: DrillingSite,
                    as: 'drillingSite',
                    include: [{
                        model: MiningSite,
                        as: 'miningSite'
                    }]
                }]
            });

            if (!pattern) {
                throw new Error('Pattern not found');
            }

            return pattern;
        } catch (error) {
            console.error('Error in getPatternById:', {
                pattern_id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async updatePattern(pattern_id, data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting pattern update:', { pattern_id });

            const pattern = await DrillingPattern.findOne({
                where: { 
                    pattern_id,
                    is_active: true 
                },
                include: [{
                    model: DrillingSite,
                    as: 'drillingSite',
                    include: [{
                        model: MiningSite,
                        as: 'miningSite',
                        include: [{
                            model: License,
                            as: 'license'
                        }]
                    }]
                }]
            });

            if (!pattern) {
                throw new Error('Pattern not found');
            }

            // Validate status transition
            if (data.status && !this.isValidStatusTransition(pattern.status, data.status)) {
                throw new Error(`Invalid status transition from ${pattern.status} to ${data.status}`);
            }

            await pattern.update(data, { transaction });

            // Validate against license if relevant parameters changed
            if (data.spacing || data.burden || data.design_depth || data.total_holes) {
                const validationResult = await this.validatePatternAgainstLicense(pattern, pattern.drillingSite.miningSite.license);
                if (!validationResult.isValid) {
                    await transaction.rollback();
                    throw new Error(`License validation failed: ${validationResult.violations.join(', ')}`);
                }
            }

            await transaction.commit();
            return pattern;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updatePattern:', {
                pattern_id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async deletePattern(pattern_id) {
        try {
            console.log('Starting pattern deletion:', { pattern_id });

            const pattern = await DrillingPattern.findOne({
                where: { 
                    pattern_id,
                    is_active: true 
                }
            });

            if (!pattern) {
                throw new Error('Pattern not found');
            }

            // Soft delete
            await pattern.update({ is_active: false });

            return true;
        } catch (error) {
            console.error('Error in deletePattern:', {
                pattern_id,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'DRAFT': ['APPROVED'],
            'APPROVED': ['IN_PROGRESS'],
            'IN_PROGRESS': ['COMPLETED']
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }


    async validatePatternAgainstLicense(pattern, license) {
        try {
            const violations = [];
            
            if (pattern.spacing > license.max_spacing) {
                violations.push(`Spacing exceeds maximum allowed (${license.max_spacing}m)`);
            }
            
            if (pattern.burden > license.max_burden) {
                violations.push(`Burden exceeds maximum allowed (${license.max_burden}m)`);
            }
            
            if (pattern.design_depth > license.max_depth_of_hole) {
                violations.push(`Hole depth exceeds maximum allowed (${license.max_depth_of_hole}m)`);
            }
    
            if (pattern.total_holes > license.max_hole_per_blast) {
                violations.push(`Total holes exceed maximum allowed per blast (${license.max_hole_per_blast})`);
            }
    
            return {
                isValid: violations.length === 0,
                violations
            };
        } catch (error) {
            console.error('Error in validatePatternAgainstLicense:', error);
            throw error;
        }
    }


    // Add to drilling-pattern.service.js
async uploadPatternDiagram(pattern_id, file) {
    const transaction = await sequelize.transaction();
    try {
        console.log('Processing pattern diagram upload:', {
            patternId: pattern_id,
            filename: file.filename
        });

        const pattern = await DrillingPattern.findOne({
            where: { 
                pattern_id,
                is_active: true 
            }
        });

        if (!pattern) {
            throw new Error('Pattern not found');
        }

        // Update pattern with new diagram URL
        await pattern.update({
            pattern_diagram_url: `/uploads/pattern-diagrams/${file.filename}`
        }, { transaction });

        await transaction.commit();
        return pattern;
    } catch (error) {
        await transaction.rollback();
        console.error('Error in uploadPatternDiagram:', error);
        throw error;
    }
}

    
}

module.exports = new DrillingPatternService();