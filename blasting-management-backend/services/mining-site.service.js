// services/mining-site.service.js
const { MiningSite, License, TestBlastDetails, MonitoringLocation, TestBlast } = require('../models');
const coordinateService = require('./coordinate-conversion.service');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class MiningSiteService {
    /**
     * Create new mining site
     */
    async createSite(siteData) {
        try {
            // Validate coordinates
            coordinateService.validateKadawalaCoordinates(
                siteData.site_kadawala_gps_north,
                siteData.site_kadawala_gps_east
            );

            // Convert coordinates
            const wgsCoords = coordinateService.kadawalaToWGS84(
                siteData.site_kadawala_gps_north,
                siteData.site_kadawala_gps_east
            );

            const site = await MiningSite.create({
                license_id: siteData.license_id,
                site_name: siteData.site_name,
                site_address: siteData.site_address,
                site_district: siteData.site_district,
                site_mining_engineer: siteData.site_mining_engineer,
                site_kadawala_gps_north: siteData.site_kadawala_gps_north,
                site_kadawala_gps_east: siteData.site_kadawala_gps_east,
                site_wgs_north: wgsCoords.latitude,
                site_wgs_east: wgsCoords.longitude,
                is_active: true
            });

            return site;
        } catch (error) {
            throw new Error(`Error creating mining site: ${error.message}`);
        }
    }

    /**
     * Get all mining sites with filters
     */
    async getAllSites(filters) {
        try {
            const whereClause = {};
            
            // Status filter
            if (filters.status !== undefined) {
                whereClause.is_active = filters.status === 'true';
            }

            // District filter
            if (filters.district) {
                whereClause.site_district = filters.district;
            }

            // Search filter
            if (filters.search) {
                whereClause[Op.or] = [
                    { site_name: { [Op.like]: `%${filters.search}%` } },
                    { site_address: { [Op.like]: `%${filters.search}%` } },
                    { site_mining_engineer: { [Op.like]: `%${filters.search}%` } }
                ];
            }

            // Calculate offset
            const offset = (filters.page - 1) * filters.limit;

            return await MiningSite.findAndCountAll({
                where: whereClause,
                include: [{
                    model: License,
                    as: 'license',
                    attributes: ['license_number', 'issue_date', 'end_date']
                }],
                order: [[filters.sortBy, filters.sortOrder]],
                limit: parseInt(filters.limit),
                offset: offset,
                distinct: true
            });
        } catch (error) {
            throw new Error(`Error fetching mining sites: ${error.message}`);
        }
    }

    /**
     * Get mining site by ID
     */
    async getSiteById(siteId) {
        try {
            const site = await MiningSite.findByPk(siteId, {
                include: [{
                    model: License,
                    as: 'license',
                    attributes: ['license_number', 'issue_date', 'end_date']
                }]
            });
            
            if (!site) {
                throw new Error('Mining site not found');
            }
            
            return site;
        } catch (error) {
            throw new Error(`Error fetching mining site: ${error.message}`);
        }
    }


    

    /**
     * Update mining site
     */
    async updateSite(siteId, updateData) {
        try {
            const site = await MiningSite.findByPk(siteId);
            if (!site) {
                throw new Error('Mining site not found');
            }

            // If coordinates are being updated, convert them
            if (updateData.site_kadawala_gps_north && updateData.site_kadawala_gps_east) {
                coordinateService.validateKadawalaCoordinates(
                    updateData.site_kadawala_gps_north,
                    updateData.site_kadawala_gps_east
                );

                const wgsCoords = coordinateService.kadawalaToWGS84(
                    updateData.site_kadawala_gps_north,
                    updateData.site_kadawala_gps_east
                );

                updateData.site_wgs_north = wgsCoords.latitude;
                updateData.site_wgs_east = wgsCoords.longitude;
            }

            await site.update(updateData);
            return site;
        } catch (error) {
            throw new Error(`Error updating mining site: ${error.message}`);
        }
    }

    /**
     * Get site with full details including test blasts and monitoring locations
     */
    async getSiteWithDetails(siteId) {
        try {
            const site = await MiningSite.findByPk(siteId, {
                include: [
                    {
                        model: License,
                        as: 'license',
                        attributes: ['license_number', 'issue_date', 'end_date']
                    },
                    {
                
                        
                            model: TestBlastDetails,
                            as : 'testBlastDetails',
                            attributes: ['test_blast_details_id', 'blast_date', 'number_of_blasts']
                    
                    },
                    {
                        model: MonitoringLocation,
                        where: { is_active: true },
                        as : 'monitoringLocations',
                        required: false
                    }
                ]
            });

            if (!site) {
                throw new Error('Mining site not found');
            }

            return site;
        } catch (error) {
            throw new Error(`Error fetching site details: ${error.message}`);
        }
    }

    /**
     * Get sites by license
     */
    async getSitesByLicense(licenseId) {
        try {
            const sites = await MiningSite.findAll({
                where: { 
                    license_id: licenseId,
                    is_active: true 
                },
                include: [{
                    model: TestBlastDetails,
                    limit: 5,
                    order: [['created_at', 'DESC']]
                }],
                order: [['site_name', 'ASC']]
            });
            return sites;
        } catch (error) {
            throw new Error(`Error fetching sites by license: ${error.message}`);
        }
    }

    /**
     * Search sites
     */
    async searchSites(searchTerm, district = null) {
        try {
            const whereClause = {
                is_active: true,
                [Op.or]: [
                    { site_name: { [Op.like]: `%${searchTerm}%` } },
                    { site_address: { [Op.like]: `%${searchTerm}%` } },
                    { site_mining_engineer: { [Op.like]: `%${searchTerm}%` } }
                ]
            };

            if (district) {
                whereClause.site_district = district;
            }

            const sites = await MiningSite.findAll({
                where: whereClause,
                include: [{
                    model: License,
                    as: 'license',
                    attributes: ['license_number', 'issue_date', 'end_date']
                }],
                order: [['site_name', 'ASC']]
            });

            return sites;
        } catch (error) {
            throw new Error(`Error searching mining sites: ${error.message}`);
        }
    }

    /**
     * Deactivate site
     */
    async deactivateSite(siteId) {
        try {
            const site = await MiningSite.findByPk(siteId);
            if (!site) {
                throw new Error('Mining site not found');
            }

            // Check if there are any pending test blasts
            const pendingBlasts = await TestBlastDetails.findOne({
                where: {
                    site_id: siteId,
                    is_approved: false
                }
            });

            if (pendingBlasts) {
                throw new Error('Cannot deactivate site with pending test blasts');
            }

            await site.update({ is_active: false });
            return site;
        } catch (error) {
            throw new Error(`Error deactivating mining site: ${error.message}`);
        }
    }

    /**
     * Get site statistics
     */
    async getSiteStatistics(siteId) {
        try {
            const site = await MiningSite.findByPk(siteId);
            if (!site) {
                throw new Error('Mining site not found');
            }

            const blastStats = await TestBlastDetails.findAll({
                where: { site_id: siteId },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('test_blast_details_id')), 'total_blasts'],
                    [sequelize.fn('SUM', sequelize.col('number_of_blasts')), 'total_explosions'],
                    [sequelize.fn('COUNT', 
                        sequelize.literal('CASE WHEN is_approved = true THEN 1 END')), 
                    'approved_blasts']
                ],
                raw: true
            });

            const monitoringStats = await MonitoringLocation.findAll({
                where: { site_id: siteId },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('monitoring_location_id')), 'total_locations'],
                    [sequelize.fn('COUNT', 
                        sequelize.literal('CASE WHEN is_active = true THEN 1 END')), 
                    'active_locations']
                ],
                raw: true
            });

            return {
                blastStatistics: blastStats[0],
                monitoringStatistics: monitoringStats[0]
            };
        } catch (error) {
            throw new Error(`Error fetching site statistics: ${error.message}`);
        }
    }

    /**
     * Validate site operation
     */
    async validateSiteOperation(siteId) {
        try {
            const site = await MiningSite.findByPk(siteId, {
                include: [{
                    model: License,
                    as: 'license',
                    attributes: ['issue_date', 'end_date']
                }]
            });

            if (!site) {
                throw new Error('Mining site not found');
            }

            const currentDate = new Date();
            const license = site.license;

            const isLicenseValid = license && 
                                 new Date(license.issue_date) <= currentDate && 
                                 new Date(license.end_date) >= currentDate;

            const activeMonitoringLocations = await MonitoringLocation.count({
                where: {
                    site_id: siteId,
                    is_active: true
                }
            });

            const recentTestBlasts = await TestBlastDetails.findAll({
                where: {
                    site_id: siteId,
                    blast_date: {
                        [Op.gte]: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000))
                    }
                },
                order: [['blast_date', 'DESC']],
                limit: 5
            });

            return {
                isOperational: site.is_active && isLicenseValid,
                licenseValid: isLicenseValid,
                hasActiveMonitoringLocations: activeMonitoringLocations > 0,
                activeMonitoringLocationsCount: activeMonitoringLocations,
                recentTestBlastsCount: recentTestBlasts.length,
                licenseExpiryDate: license?.end_date
            };
        } catch (error) {
            throw new Error(`Error validating site operation: ${error.message}`);
        }
    }
}

module.exports = new MiningSiteService();