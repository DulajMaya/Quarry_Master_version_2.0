// services/gsmb-officer.service.js
const { GSMBOfficer, TestBlast } = require('../models');
const { Op } = require('sequelize');

class GSMBOfficerService {
    async createOfficer(officerData) {
        try {
            const existingOfficer = await GSMBOfficer.findOne({
                where: {
                    [Op.or]: [
                        { email_address: officerData.email_address },
                        { telephone_number: officerData.telephone_number }
                    ]
                }
            });

            if (existingOfficer) {
                throw new Error('Officer with this email or telephone already exists');
            }

            const officer = await GSMBOfficer.create({
                name: officerData.name,
                telephone_number: officerData.telephone_number,
                email_address: officerData.email_address,
                is_active: true
            });

            return officer;
        } catch (error) {
            throw new Error(`Error creating GSMB officer: ${error.message}`);
        }
    }

    async updateOfficer(officerId, updateData) {
        try {
            const officer = await GSMBOfficer.findByPk(officerId);
            if (!officer) {
                throw new Error('GSMB officer not found');
            }

            // Check for duplicate email/phone if being updated
            if (updateData.email_address || updateData.telephone_number) {
                const existingOfficer = await GSMBOfficer.findOne({
                    where: {
                        [Op.and]: [
                            { gsmb_officer_id: { [Op.ne]: officerId } },
                            {
                                [Op.or]: [
                                    { email_address: updateData.email_address || officer.email_address },
                                    { telephone_number: updateData.telephone_number || officer.telephone_number }
                                ]
                            }
                        ]
                    }
                });

                if (existingOfficer) {
                    throw new Error('Email or telephone already in use by another officer');
                }
            }

            await officer.update(updateData);
            return officer;
        } catch (error) {
            throw new Error(`Error updating GSMB officer: ${error.message}`);
        }
    }

    async getOfficerById(officerId) {
        try {
            const officer = await GSMBOfficer.findByPk(officerId);
            if (!officer) {
                throw new Error('GSMB officer not found');
            }
            return officer;
        } catch (error) {
            throw new Error(`Error fetching GSMB officer: ${error.message}`);
        }
    }

    async getAllActiveOfficers() {
        try {
            const officers = await GSMBOfficer.findAll({
                where: { is_active: true },
                order: [['name', 'ASC']]
            });
            return officers;
        } catch (error) {
            throw new Error(`Error fetching active GSMB officers: ${error.message}`);
        }
    }

    async getOfficerTestBlasts(officerId) {
        try {
            const testBlasts = await TestBlast.findAll({
                where: { gsmb_officer_id: officerId },
                order: [['created_at', 'DESC']]
            });
            return testBlasts;
        } catch (error) {
            throw new Error(`Error fetching officer's test blasts: ${error.message}`);
        }
    }

    async deactivateOfficer(officerId) {
        try {
            const officer = await GSMBOfficer.findByPk(officerId);
            if (!officer) {
                throw new Error('GSMB officer not found');
            }

            await officer.update({ is_active: false });
            return officer;
        } catch (error) {
            throw new Error(`Error deactivating GSMB officer: ${error.message}`);
        }
    }

    async searchOfficers(searchTerm) {
        try {
            const officers = await GSMBOfficer.findAll({
                where: {
                    [Op.and]: [
                        { is_active: true },
                        {
                            [Op.or]: [
                                { name: { [Op.like]: `%${searchTerm}%` } },
                                { email_address: { [Op.like]: `%${searchTerm}%` } },
                                { telephone_number: { [Op.like]: `%${searchTerm}%` } }
                            ]
                        }
                    ]
                }
            });
            return officers;
        } catch (error) {
            throw new Error(`Error searching GSMB officers: ${error.message}`);
        }
    }
}

module.exports = new GSMBOfficerService();