// services/test-blast.service.js
const { 
    TestBlastDetails, 
    TestBlast, 
    TestBlastHole,
    TestBlastMonitoring,
    GSMBOfficer,
    MonitoringLocation 
} = require('../models');
const coordinateService = require('./coordinate-conversion.service');
const { Op } = require('sequelize');

class TestBlastService {
    async createTestBlastDetails(data) {
        try {
            const testBlastDetails = await TestBlastDetails.create({
                site_id: data.site_id,
                license_id: data.license_id,
                blast_date: data.blast_date,
                number_of_blasts: data.number_of_blasts,
                approval_comments: data.approval_comments,
                is_approved: false
            });
            return testBlastDetails;
        } catch (error) {
            throw new Error(`Error creating test blast details: ${error.message}`);
        }
    }

    async createTestBlast(data) {
        try {
            // Convert coordinates
            const wgsCoords = coordinateService.kadawalaToWGS84(
                data.kadawala_gps_north,
                data.kadawala_gps_east
            );

            const testBlast = await TestBlast.create({
                test_blast_details_id: data.test_blast_details_id,
                gsmb_officer_id: data.gsmb_officer_id,
                kadawala_gps_north: data.kadawala_gps_north,
                kadawala_gps_east: data.kadawala_gps_east,
                wgs_north: wgsCoords.latitude,
                wgs_east: wgsCoords.longitude,
                time_fired: data.time_fired,
                number_of_holes: data.number_of_holes,
                number_of_rows: data.number_of_rows,
                holes_sketch_url: data.holes_sketch_url
            });
            return testBlast;
        } catch (error) {
            throw new Error(`Error creating test blast: ${error.message}`);
        }
    }

    async createTestBlastHole(data) {
        try {
            const testBlastHole = await TestBlastHole.create({
                test_blast_id: data.test_blast_id,
                water_gel_use: data.water_gel_use,
                anfo_use: data.anfo_use,
                ed_delay_number: data.ed_delay_number,
                diameter: data.diameter,
                depth: data.depth,
                bench_height: data.bench_height,
                stemming_height: data.stemming_height
            });
            return testBlastHole;
        } catch (error) {
            throw new Error(`Error creating test blast hole: ${error.message}`);
        }
    }

    async getTestBlastDetailsById(id) {
        try {
            const details = await TestBlastDetails.findByPk(id, {
                include: [{
                    model: TestBlast,
                    include: [
                        { model: TestBlastHole },
                        { 
                            model: TestBlastMonitoring,
                            include: [{ model: MonitoringLocation }]
                        },
                        { model: GSMBOfficer }
                    ]
                }]
            });
            if (!details) {
                throw new Error('TestBlastDetails not found');
            }

            return details;
        } catch (error) {
            throw new Error(`Error fetching test blast details: ${error.message}`);
        }
    }

    async updateTestBlastApproval(id, approvalData) {
        try {
            const testBlastDetails = await TestBlastDetails.findByPk(id);
            if (!testBlastDetails) {
                throw new Error('Test blast details not found');
            }

            await testBlastDetails.update({
                is_approved: approvalData.is_approved,
                approval_comments: approvalData.comments
            });
            return testBlastDetails;
        } catch (error) {
            throw new Error(`Error updating approval status: ${error.message}`);
        }
    }

    async getTestBlastsByLicense(licenseId) {
        try {
            const blasts = await TestBlastDetails.findAll({
                where: { license_id: licenseId },
                include: [{
                    model: TestBlast,
                    include: [{ model: GSMBOfficer }]
                }],
                order: [['created_at', 'DESC']]
            });
            return blasts;
        } catch (error) {
            throw new Error(`Error fetching test blasts by license: ${error.message}`);
        }
    }

    async getTestBlastsBySite(siteId) {
        try {
            const blasts = await TestBlastDetails.findAll({
                where: { site_id: siteId },
                include: [{
                    model: TestBlast,
                    include: [
                        { model: TestBlastHole },
                        { model: GSMBOfficer }
                    ]
                }],
                order: [['created_at', 'DESC']]
            });
            return blasts;
        } catch (error) {
            throw new Error(`Error fetching test blasts by site: ${error.message}`);
        }
    }

    async getTestBlastById(blastId) {
        try {
            const blast = await TestBlast.findByPk(blastId, {
                include: [
                    { model: TestBlastHole },
                    { model: GSMBOfficer }
                ]
            });
            return blast;
        } catch (error) {
            throw new Error(`Error fetching test blast: ${error.message}`);
        }
    }

    async getTestBlastMonitoring(blastId) {
        try {
            const monitoring = await TestBlastMonitoring.findAll({
                where: { test_blast_id: blastId },
                include: [{
                    model: MonitoringLocation,
                    attributes: ['owners_name', 'address', 'location_description']
                }],
                order: [['measured_at', 'DESC']]
            });
            return monitoring;
        } catch (error) {
            throw new Error(`Error fetching test blast monitoring: ${error.message}`);
        }
    }

    async validateTestBlast(blastId) {
        try {
            const blast = await TestBlast.findByPk(blastId);
            if (!blast) {
                throw new Error('Test blast not found');
            }

            const holes = await TestBlastHole.count({
                where: { test_blast_id: blastId }
            });

            const monitoring = await TestBlastMonitoring.count({
                where: { test_blast_id: blastId }
            });

            return {
                isComplete: holes > 0 && monitoring > 0,
                holeCount: holes,
                monitoringCount: monitoring,
                hasSketch: !!blast.holes_sketch_url
            };
        } catch (error) {
            throw new Error(`Error validating test blast: ${error.message}`);
        }
    }

    async getTestBlastStatistics(startDate, endDate, siteId = null) {
        try {
            const whereClause = {
                created_at: {
                    [Op.between]: [startDate, endDate]
                }
            };

            if (siteId) {
                whereClause.site_id = siteId;
            }

            const stats = await TestBlastDetails.findAll({
                where: whereClause,
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('test_blast_details_id')), 'total_blasts'],
                    [sequelize.fn('SUM', sequelize.col('number_of_blasts')), 'total_explosions'],
                    [sequelize.fn('AVG', sequelize.col('number_of_blasts')), 'avg_blasts_per_test']
                ],
                raw: true
            });

            return stats[0];
        } catch (error) {
            throw new Error(`Error fetching test blast statistics: ${error.message}`);
        }
    }
    // new
    async getAllTestBlastDetails() {
        try {
            console.log('test-blast');
            const testBlastDetails = await TestBlastDetails.findAll({
                include: [
                    {
                        model: TestBlast,
                        include: [
                            { model: TestBlastHole },
                            {
                                model: TestBlastMonitoring,
                                include: [{ model: MonitoringLocation }]
                            },
                            { model: GSMBOfficer }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']]
            });
            return testBlastDetails;
        } catch (error) {
            throw new Error(`Error fetching all test blast details: ${error.message}`);
        }
    }
}

module.exports = new TestBlastService();