// services/drilling-site.service.js
const { DrillingSite, MiningSite } = require('../models');
const { Op } = require('sequelize');

class DrillingSiteService {
    async createDrillingSite(data) {
        try {
            console.log('Starting drilling site creation:', {
                miningSiteId: data.miningSiteId,
                benchId: data.bench_id
            });

            const drillingSite = await DrillingSite.create({
                ...data,
                created_by: data.userId
            });

            console.log('Successfully created drilling site:', {
                drillingSiteId: drillingSite.drilling_site_id,
                miningSiteId: drillingSite.miningSiteId
            });

            return drillingSite;
        } catch (error) {
            console.error('Error in createDrillingSite:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getDrillingSites(miningSiteId, query = {}) {
        try {
            console.log('Fetching drilling sites:', { miningSiteId, query });

            const {
                page = 1,
                limit = 10,
                status,
                startDate,
                endDate,
                search
            } = query;

            const where = { miningSiteId, is_active: true };

            if (status) {
                where.status = status;
            }

            if (startDate && endDate) {
                where.drilling_date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            if (search) {
                where[Op.or] = [
                    { bench_id: { [Op.like]: `%${search}%` } },
                    { rock_type: { [Op.like]: `%${search}%` } }
                ];
            }

            const drillingSites = await DrillingSite.findAndCountAll({
                where,
                include: [{
                    model: MiningSite,
                    as: 'miningSite',
                    attributes: ['site_name']
                }],
                order: [['drilling_date', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            console.log('Successfully retrieved drilling sites:', {
                miningSiteId,
                count: drillingSites.count
            });

            return {
                total: drillingSites.count,
                pages: Math.ceil(drillingSites.count / limit),
                currentPage: parseInt(page),
                drillingSites: drillingSites.rows
            };
        } catch (error) {
            console.error('Error in getDrillingSites:', {
                miningSiteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getDrillingSiteById(drilling_site_id, ) {
        try {
            console.log('Fetching drilling site details:', { 
                drilling_site_id, 
            });

            const drillingSite = await DrillingSite.findOne({
                where: { 
                    drilling_site_id,
                    //miningSiteId,
                    is_active: true 
                },
                include: [{
                    model: MiningSite,
                    as: 'miningSite',
                    attributes: ['site_name']
                }]
            });

            if (!drillingSite) {
                throw new Error('Drilling site not found');
            }

            console.log('Successfully retrieved drilling site details:', {
                drilling_site_id,
               // miningSiteId
            });

            return drillingSite;
        } catch (error) {
            console.error('Error in getDrillingSiteById:', {
                drilling_site_id,
                //miningSiteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async updateDrillingSite(drilling_site_id, miningSiteId, data) {
        try {
            console.log('Starting drilling site update:', {
                drilling_site_id,
                miningSiteId
            });

            const drillingSite = await DrillingSite.findOne({
                where: { 
                    drilling_site_id,
                    miningSiteId,
                    is_active: true 
                }
            });

            if (!drillingSite) {
                throw new Error('Drilling site not found');
            }

            // Validate status transition
            if (data.status && !this.isValidStatusTransition(drillingSite.status, data.status)) {
                throw new Error(`Invalid status transition from ${drillingSite.status} to ${data.status}`);
            }

            await drillingSite.update(data);

            console.log('Successfully updated drilling site:', {
                drilling_site_id,
                miningSiteId
            });

            return drillingSite;
        } catch (error) {
            console.error('Error in updateDrillingSite:', {
                drilling_site_id,
                miningSiteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async deleteDrillingSite(drilling_site_id, miningSiteId) {
        try {
            console.log('Starting drilling site deletion:', {
                drilling_site_id,
                miningSiteId
            });

            const drillingSite = await DrillingSite.findOne({
                where: { 
                    drilling_site_id,
                    miningSiteId,
                    is_active: true 
                }
            });

            if (!drillingSite) {
                throw new Error('Drilling site not found');
            }

            // Soft delete
            await drillingSite.update({ is_active: false });

            console.log('Successfully deleted drilling site:', {
                drilling_site_id,
                miningSiteId
            });

            return true;
        } catch (error) {
            console.error('Error in deleteDrillingSite:', {
                drilling_site_id,
                miningSiteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    isValidStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'PLANNED': ['ACTIVE'],
            'ACTIVE': ['COMPLETED'],
            'COMPLETED': ['BLASTED']
        };

        return validTransitions[currentStatus]?.includes(newStatus);
    }
}

module.exports = new DrillingSiteService();