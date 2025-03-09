// services/monitoring-location.service.js
const { MonitoringLocation, TestBlastMonitoring, MiningSite } = require('../models');
const { Op } = require('sequelize');
const coordinateService = require('./coordinate-conversion.service');

class MonitoringLocationService {
    async createLocation(locationData) {
        try {
            // Validate coordinates
            coordinateService.validateKadawalaCoordinates(
                locationData.kadawala_gps_north,
                locationData.kadawala_gps_east
            );

            // Convert coordinates
            const wgsCoords = coordinateService.kadawalaToWGS84(
                locationData.kadawala_gps_north,
                locationData.kadawala_gps_east
            );

            const location = await MonitoringLocation.create({
                site_id: locationData.site_id,
                kadawala_gps_north: locationData.kadawala_gps_north,
                kadawala_gps_east: locationData.kadawala_gps_east,
                wgs_north: wgsCoords.latitude,
                wgs_east: wgsCoords.longitude,
                owners_name: locationData.owners_name,
                address: locationData.address,
                telephone_number: locationData.telephone_number,
                email_address: locationData.email_address,
                location_description: locationData.location_description,
                is_active: true
            });

            return location;
        } catch (error) {
            throw new Error(`Error creating monitoring location: ${error.message}`);
        }
    }

    async updateLocation(locationId, updateData) {
        try {
            const location = await MonitoringLocation.findByPk(locationId);
            if (!location) {
                throw new Error('Monitoring location not found');
            }

            if (updateData.kadawala_gps_north && updateData.kadawala_gps_east) {
                coordinateService.validateKadawalaCoordinatess(
                    updateData.kadawala_gps_north,
                    updateData.kadawala_gps_east
                );

                const wgsCoords = coordinateService.kadawalaToWGS84(
                    updateData.kadawala_gps_north,
                    updateData.kadawala_gps_east
                );

                updateData.wgs_north = wgsCoords.latitude;
                updateData.wgs_east = wgsCoords.longitude;
            }

            await location.update(updateData);
            return location;
        } catch (error) {
            throw new Error(`Error updating monitoring location: ${error.message}`);
        }
    }

    async getLocationById(locationId) {
        try {
            const location = await MonitoringLocation.findByPk(locationId, {
                include: [{
                    model: MiningSite,
                    as: 'miningSite',
                    attributes: ['site_name', 'site_district']
                }]
            });
            if (!location) {
                throw new Error('Monitoring location not found');
            }
            return location;
        } catch (error) {
            throw new Error(`Error fetching monitoring location: ${error.message}`);
        }
    }

    async getLocationsBySite(siteId) {
        try {
            const locations = await MonitoringLocation.findAll({
                where: { 
                    site_id: siteId,
                    is_active: true
                },
                order: [['created_at', 'DESC']]
            });
            return locations;
        } catch (error) {
            throw new Error(`Error fetching locations by site: ${error.message}`);
        }
    }

    async getLocationWithMonitoringHistory(locationId) {
        try {
            const location = await MonitoringLocation.findByPk(locationId, {
                include: [{
                    model: TestBlastMonitoring,
                    order: [['measured_at', 'DESC']]
                }]
            });
            return location;
        } catch (error) {
            throw new Error(`Error fetching location monitoring history: ${error.message}`);
        }
    }

    async searchLocations(searchTerm) {
        try {
            const locations = await MonitoringLocation.findAll({
                where: {
                    is_active: true,
                    [Op.or]: [
                        { owners_name: { [Op.like]: `%${searchTerm}%` } },
                        { address: { [Op.like]: `%${searchTerm}%` } },
                        { location_description: { [Op.like]: `%${searchTerm}%` } }
                    ]
                    // services/monitoring-location.service.js (continued)
                },
                include: [{
                    model: MiningSite,
                    as: 'miningSite',
                    attributes: ['site_name', 'site_district']
                }]
            });
            return locations;
        } catch (error) {
            throw new Error(`Error searching monitoring locations: ${error.message}`);
        }
    }

    async deactivateLocation(locationId) {
        try {
            const location = await MonitoringLocation.findByPk(locationId);
            if (!location) {
                throw new Error('Monitoring location not found');
            }

            await location.update({ is_active: false });
            return location;
        } catch (error) {
            throw new Error(`Error deactivating monitoring location: ${error.message}`);
        }
    }

    async getLocationsByDistance(siteId, maxDistanceKm) {
        try {
            const site = await MiningSite.findByPk(siteId);
            if (!site) {
                throw new Error('Site not found');
            }

            // Using Haversine formula in MySQL
            const locations = await MonitoringLocation.findAll({
                attributes: {
                    include: [
                        [
                            sequelize.literal(`
                                6371 * acos(
                                    cos(radians(${site.site_wgs_north})) * 
                                    cos(radians(wgs_north)) * 
                                    cos(radians(wgs_east) - radians(${site.site_wgs_east})) + 
                                    sin(radians(${site.site_wgs_north})) * 
                                    sin(radians(wgs_north))
                                )
                            `),
                            'distance'
                        ]
                    ]
                },
                where: {
                    is_active: true
                },
                having: sequelize.literal(`distance <= ${maxDistanceKm}`),
                order: [[sequelize.literal('distance'), 'ASC']]
            });
            return locations;
        } catch (error) {
            throw new Error(`Error fetching locations by distance: ${error.message}`);
        }
    }

    async getMonitoringStatistics(locationId) {
        try {
            const stats = await TestBlastMonitoring.findAll({
                where: { monitoring_location_id: locationId },
                attributes: [
                    [sequelize.fn('AVG', sequelize.col('ground_vibration_value')), 'avg_ground_vibration'],
                    [sequelize.fn('MAX', sequelize.col('ground_vibration_value')), 'max_ground_vibration'],
                    [sequelize.fn('AVG', sequelize.col('air_blast_over_pressure_value')), 'avg_air_blast'],
                    [sequelize.fn('MAX', sequelize.col('air_blast_over_pressure_value')), 'max_air_blast'],
                    [sequelize.fn('COUNT', sequelize.col('test_blast_monitoring_id')), 'total_measurements']
                ]
            });
            return stats[0];
        } catch (error) {
            throw new Error(`Error fetching monitoring statistics: ${error.message}`);
        }
    }

    async bulkCreateLocations(locations) {
        try {
            // Process each location's coordinates
            const processedLocations = await Promise.all(locations.map(async (loc) => {
                const wgsCoords = coordinateService.kadawalaToWGS84(
                    loc.kadawala_gps_north,
                    loc.kadawala_gps_east
                );
                return {
                    ...loc,
                    wgs_north: wgsCoords.latitude,
                    wgs_east: wgsCoords.longitude,
                    is_active: true
                };
            }));

            const createdLocations = await MonitoringLocation.bulkCreate(processedLocations, {
                validate: true
            });
            return createdLocations;
        } catch (error) {
            throw new Error(`Error in bulk location creation: ${error.message}`);
        }
    }

    async validateLocationRelations(locationId) {
        try {
            const location = await MonitoringLocation.findByPk(locationId);
            if (!location) {
                throw new Error('Monitoring location not found');
            }

            // Check if the location has any monitoring records
            const monitoringCount = await TestBlastMonitoring.count({
                where: { monitoring_location_id: locationId }
            });

            // Check if the associated site is still active
            const site = await MiningSite.findByPk(location.site_id);
            
            return {
                hasMonitoringRecords: monitoringCount > 0,
                isSiteActive: site?.is_active || false,
                totalMonitoringRecords: monitoringCount
            };
        } catch (error) {
            throw new Error(`Error validating location relations: ${error.message}`);
        }
    }
}

module.exports = new MonitoringLocationService();
