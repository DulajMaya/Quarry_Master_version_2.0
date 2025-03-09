// services/blast-result.service.js
const { 
    BlastResult, 
    BlastEvent, 
    BlastHole,
    DrillingSite,
    DailyBlastOperation 
} = require('../models');
const sequelize = require('../config/db.config');

class BlastResultService {
    async createBlastResult(data) {
        const transaction = await sequelize.transaction();
        try {
            console.log('Starting blast result creation:', {
                blastId: data.blast_id
            });

            // Validate blast event
            const blastEvent = await BlastEvent.findOne({
                where: { blast_id: data.blast_id }
            });

            if (!blastEvent) {
                throw new Error('Blast event not found');
            }

            if (blastEvent.status !== 'COMPLETED') {
                throw new Error('Cannot record results for uncompleted blast');
            }

            // Check for existing result
            const existingResult = await BlastResult.findOne({
                where: { blast_id: data.blast_id }
            });

            if (existingResult) {
                throw new Error('Blast result already exists');
            }

            // Create result
            const result = await BlastResult.create({
                ...data,
                created_by: data.userId
            }, { transaction });

            // Handle photo uploads if provided
            if (data.photos) {
                const photoUrls = await this.handlePhotoUploads(data.photos);
                await result.update({ photos_url: photoUrls }, { transaction });
            }

            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in createBlastResult:', error);
            throw error;
        }
    }

    async updateBlastResult(result_id, data) {
        const transaction = await sequelize.transaction();
        try {
            const result = await BlastResult.findByPk(result_id);
            if (!result) {
                throw new Error('Blast result not found');
            }

            // Update result
            await result.update(data, { transaction });

            // Handle new photos if provided
            if (data.photos) {
                const existingPhotos = result.photos_url || [];
                const newPhotoUrls = await this.handlePhotoUploads(data.photos);
                await result.update({ 
                    photos_url: [...existingPhotos, ...newPhotoUrls] 
                }, { transaction });
            }

            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateBlastResult:', error);
            throw error;
        }
    }

    async getBlastResult(blast_id) {
        try {
            const result = await BlastResult.findOne({
                where: { blast_id },
                include: [{
                    model: BlastEvent,
                    as: 'blastEvent',
                    include: [{
                        model: DrillingSite,
                        as: 'drillingSite'
                    }]
                }]
            });

            if (!result) {
                throw new Error('Blast result not found');
            }

            return result;
        } catch (error) {
            console.error('Error in getBlastResult:', error);
            throw error;
        }
    }

    async getBlastResults(miningSiteId, query = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                startDate,
                endDate,
                fragmentation,
                flyrock = null
            } = query;

            const where = {};
            
            if (startDate && endDate) {
                where.created_at = {
                    [Op.between]: [startDate, endDate]
                };
            }

            if (fragmentation) {
                where.fragmentation_quality = fragmentation;
            }

            if (flyrock !== null) {
                where.flyrock_occurrence = flyrock;
            }

            const results = await BlastResult.findAndCountAll({
                include: [{
                    model: BlastEvent,
                    as: 'blastEvent',
                    required: true,
                    include: [{
                        model: DailyBlastOperation,
                        where: { miningSiteId },
                        required: true
                    }]
                }],
                where,
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            return {
                total: results.count,
                pages: Math.ceil(results.count / limit),
                currentPage: parseInt(page),
                results: results.rows
            };
        } catch (error) {
            console.error('Error in getBlastResults:', error);
            throw error;
        }
    }

    async generateSummaryReport(miningSiteId, startDate, endDate) {
        try {
            const results = await BlastResult.findAll({
                include: [{
                    model: BlastEvent,
                    as: 'blastEvent',
                    required: true,
                    include: [{
                        model: DailyBlastOperation,
                        where: { miningSiteId },
                        required: true
                    }]
                }],
                where: {
                    created_at: {
                        [Op.between]: [startDate, endDate]
                    }
                }
            });

            // Calculate summary statistics
            const summary = {
                totalBlasts: results.length,
                fragmentationQuality: {
                    EXCELLENT: 0,
                    GOOD: 0,
                    FAIR: 0,
                    POOR: 0
                },
                flyrockIncidents: results.filter(r => r.flyrock_occurrence).length,
                averageThrowDistance: 0,
                averageBackBreak: 0
            };

            let totalThrowDistance = 0;
            let totalBackBreak = 0;

            results.forEach(result => {
                summary.fragmentationQuality[result.fragmentation_quality]++;
                if (result.throw_distance) totalThrowDistance += result.throw_distance;
                if (result.back_break) totalBackBreak += result.back_break;
            });

            summary.averageThrowDistance = totalThrowDistance / results.length;
            summary.averageBackBreak = totalBackBreak / results.length;

            return summary;
        } catch (error) {
            console.error('Error in generateSummaryReport:', error);
            throw error;
        }
    }

    handlePhotoUploads(photos) {
        // Implementation depends on your file upload service
        // Return array of photo URLs
        return Promise.resolve(photos.map(photo => photo.url));
    }
}

module.exports = new BlastResultService();