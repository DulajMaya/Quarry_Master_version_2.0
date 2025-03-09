// services/minable-boundary.service.js
const { MinableBoundary, MiningSite, License } = require('../models');
const coordinateService = require('./coordinate-conversion.service');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');

class MinableBoundaryService {
    async createBoundaryPoints(data) {
        const transaction = await sequelize.transaction();
        
        try {
            console.log('Starting boundary points creation process');

            // First validate the site-license relationship
            const validatedRelationship = await this.validateSiteLicenseRelationship(data.miningSiteId);
            
            // Use validated licenseId
            data.license_id = validatedRelationship.licenseId;

            console.log('Starting boundary points creation:', {
                siteId: validatedRelationship.siteId,
                licenseId: validatedRelationship.licenseId,
                pointsCount: data.boundaries?.length
            });

            // Create boundary points with sequence
            const boundaryPoints = await Promise.all(data.boundaries.map(async (point, index) => {
                coordinateService.validateKadawalaCoordinates(
                    point.kadawala_north,
                    point.kadawala_east
                );

                return MinableBoundary.create({
                    mining_site_id: validatedRelationship.siteId,
                    license_id: validatedRelationship.licenseId,
                    point_sequence: index + 1,
                    kadawala_north: point.kadawala_north,
                    kadawala_east: point.kadawala_east,
                    created_by: data.created_by
                }, { transaction });
            }));

            await transaction.commit();
            console.log('Successfully created boundary points:', {
                count: boundaryPoints.length,
                siteId: validatedRelationship.siteId
            });

            return boundaryPoints;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in createBoundaryPoints:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async getBoundariesBySiteId(siteId) {
        try {
            // Validate site-license relationship before fetching boundaries
            const validatedRelationship = await this.validateSiteLicenseRelationship(siteId);
            
            console.log('Fetching boundaries for site:', { 
                siteId: validatedRelationship.siteId,
                licenseName: validatedRelationship.licenseNumber 
            });

            const boundaries = await MinableBoundary.findAll({
                where: {
                    mining_site_id: validatedRelationship.siteId,
                    license_id: validatedRelationship.licenseId,
                    is_active: true
                },
                order: [['point_sequence', 'ASC']],
                include: [{
                    model: MiningSite,
                    as: 'miningSite',
                    attributes: ['site_name']
                }]
            });

            console.log('Retrieved boundary points:', {
                siteId: validatedRelationship.siteId,
                count: boundaries.length
            });

            return boundaries;
        } catch (error) {
            console.error('Error in getBoundariesBySiteId:', {
                siteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async updateBoundaryPoints(siteId, boundaries, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Validate site-license relationship before update
            const validatedRelationship = await this.validateSiteLicenseRelationship(siteId);

            console.log('Starting boundary points update:', {
                siteId: validatedRelationship.siteId,
                licenseId: validatedRelationship.licenseId,
                pointsCount: boundaries?.length
            });

            // Deactivate existing boundaries
            await MinableBoundary.update(
                { is_active: false },
                {
                    where: { 
                        mining_site_id: validatedRelationship.siteId,
                        license_id: validatedRelationship.licenseId
                    },
                    transaction
                }
            );

            // Create new boundary points
            const updatedBoundaries = await Promise.all(boundaries.map(async (point, index) => {
                coordinateService.validateKadawalaCoordinates(
                    point.kadawala_north,
                    point.kadawala_east
                );

                return MinableBoundary.create({
                    mining_site_id: validatedRelationship.siteId,
                    license_id: validatedRelationship.licenseId,
                    point_sequence: index + 1,
                    kadawala_north: point.kadawala_north,
                    kadawala_east: point.kadawala_east,
                    created_by: userId
                }, { transaction });
            }));

            await transaction.commit();
            console.log('Successfully updated boundary points:', {
                siteId: validatedRelationship.siteId,
                updatedCount: updatedBoundaries.length
            });

            return updatedBoundaries;
        } catch (error) {
            await transaction.rollback();
            console.error('Error in updateBoundaryPoints:', {
                siteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async deleteBoundaryPoints(siteId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Validate site-license relationship before deletion
            const validatedRelationship = await this.validateSiteLicenseRelationship(siteId);

            console.log('Attempting to delete boundary points:', { 
                siteId: validatedRelationship.siteId,
                licenseId: validatedRelationship.licenseId 
            });

            const result = await MinableBoundary.update(
                { is_active: false },
                {
                    where: { 
                        mining_site_id: validatedRelationship.siteId,
                        license_id: validatedRelationship.licenseId
                    },
                    transaction
                }
            );

            await transaction.commit();
            console.log('Successfully deleted boundary points:', {
                siteId: validatedRelationship.siteId,
                affectedRows: result[0]
            });

            return result[0];
        } catch (error) {
            await transaction.rollback();
            console.error('Error in deleteBoundaryPoints:', {
                siteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async validateBoundaryPoints(boundaries) {
        try {
            console.log('Validating boundary points:', {
                pointsCount: boundaries?.length
            });

            const validationResults = await Promise.all(boundaries.map(async (point) => {
                try {
                    // Validate coordinates
                    coordinateService.validateKadawalaCoordinates(
                        point.kadawala_north,
                        point.kadawala_east
                    );

                    // Convert to WGS84 for validation
                    const wgs84Coords = coordinateService.kadawalaToWGS84(
                        point.kadawala_north,
                        point.kadawala_east
                    );

                    return {
                        original: point,
                        isValid: true,
                        wgs84Coordinates: wgs84Coords
                    };
                } catch (error) {
                    return {
                        original: point,
                        isValid: false,
                        error: error.message
                    };
                }
            }));

            const isValid = validationResults.every(result => result.isValid);
            console.log('Validation complete:', {
                isValid,
                validPointsCount: validationResults.filter(r => r.isValid).length
            });

            return {
                isValid,
                results: validationResults
            };
        } catch (error) {
            console.error('Error in validateBoundaryPoints:', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async validateSiteLicenseRelationship(siteId) {
        try {
            console.log('Validating site-license relationship for:', { siteId });
    
            const site = await MiningSite.findOne({
                where: { 
                    site_id: siteId,
                    is_active: true 
                },
                include: [{
                    model: License,
                    as: 'license',
                    attributes: ['id', 'license_number', 'status'],
                    where: {
                        status: 'active'  // Only get active licenses
                    }
                }]
            });
    
            if (!site) {
                throw new Error('Mining site not found or inactive');
            }
    
            if (!site.license) {
                throw new Error('No active license found for this mining site');
            }
    
            console.log('Successfully validated site-license relationship:', {
                siteId: site.site_id,
                licenseId: site.license.id,
                licenseName: site.license.license_number
            });
    
            return {
                siteId: site.site_id,
                licenseId: site.license.id,
                siteName: site.site_name,
                licenseNumber: site.license.license_number
            };
        } catch (error) {
            console.error('Error in validateSiteLicenseRelationship:', {
                siteId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = new MinableBoundaryService();