// services/mining-license.service.js
const MiningLicense = require('../models/mining-license.model');
const { Op } = require('sequelize');
const sequelize = require('../config/db.config');
const { License, MiningSite } = require('../models');

class MiningLicenseService {
  /**
   * Create a new mining license
   */
  static async createLicense(licenseData) {
    try {
      return await MiningLicense.create(licenseData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all licenses with optional filters
   */
  static async getAllLicenses(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.district) {
        whereClause.district = filters.district;
      }

      if (filters.search) {
        whereClause[Op.or] = [
          { license_number: { [Op.like]: `%${filters.search}%` } },
          { district: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const options = {
        where: whereClause,
        order: [['created_at', 'DESC']]
      };

      // Add pagination if provided
      if (filters.page && filters.limit) {
        options.limit = parseInt(filters.limit);
        options.offset = (parseInt(filters.page) - 1) * parseInt(filters.limit);
      }

      return await MiningLicense.findAndCountAll(options);
    } catch (error) {
      throw error;
    }
  }


  /**
     * Get license by mining site ID
     */
  static async getLicenseByMiningId(miningId) {
    try {
        const site = await MiningSite.findByPk(miningId, {
            include: [{
                model: License,
                as: 'license',
                attributes: [
                    'id',
                    'license_number',
                    'issue_date',
                    'end_date',
                    'district',
                    'license_photo_url',
                    'max_hole_per_blast',
                    'max_blasts_per_day',
                    'max_depth_of_hole',
                    'max_spacing',
                    'max_burden',
                    'max_watergel_per_hole',
                    'max_anfo_per_hole',
                    'third_party_monitoring_required',
                    'status',
                    'created_at',
                    'updated_at'
                ]
            }]
        });

        if (!site) {
            throw new Error('Mining site not found');
        }

        if (!site.license) {
            throw new Error('No license found for this mining site');
        }

        return site.license;
    } catch (error) {
        throw new Error(`Error fetching license for mining site: ${error.message}`);
    }
}

  /**
   * Get license by ID with optional related data
   */
  static async getLicenseById(id, includeRelations = false) {
    try {
      const options = {
        where: { id }
      };

      if (includeRelations) {
        options.include = [
          // Add your relations here when you have them
          // Example: { model: LicenseHolder },
          // { model: TestBlast }
        ];
      }

      return await MiningLicense.findOne(options);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update license details
   */
  static async updateLicense(id, updateData) {
    const transaction = await sequelize.transaction();
    try {
      const license = await MiningLicense.findByPk(id);
      if (!license) {
        throw new Error('License not found');
      }

      await license.update(updateData, { transaction });
      
      // If you need to handle related data updates, do it here
      // Example: await this.updateRelatedData(id, updateData, transaction);

      await transaction.commit();
      return await this.getLicenseById(id, true);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Delete a license
   */
  static async deleteLicense(id) {
    const transaction = await sequelize.transaction();
    try {
      const license = await MiningLicense.findByPk(id);
      if (!license) {
        throw new Error('License not found');
      }

      // Check if deletion is allowed (add your business logic here)
      // Example: check for active operations, pending renewals, etc.

      await license.destroy({ transaction });
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get licenses expiring soon
   */
  static async getExpiringLicenses(days = 30) {
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return await MiningLicense.findAll({
        where: {
          end_date: {
            [Op.between]: [new Date(), endDate]
          },
          status: 'active'
        },
        order: [['end_date', 'ASC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if license number exists
   */
  static async checkLicenseNumberExists(licenseNumber, excludeId = null) {
    try {
      const whereClause = { license_number: licenseNumber };
      if (excludeId) {
        whereClause.id = { [Op.ne]: excludeId };
      }

      const count = await MiningLicense.count({ where: whereClause });
      return count > 0;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get licenses by district
   */
  static async getLicensesByDistrict(district) {
    try {
      return await MiningLicense.findAll({
        where: { district },
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update license status
   */
  static async updateLicenseStatus(id, status, reason = '') {
    const transaction = await sequelize.transaction();
    try {
      const license = await MiningLicense.findByPk(id);
      if (!license) {
        throw new Error('License not found');
      }

      await license.update({
        status,
        status_change_reason: reason,
        status_changed_at: new Date()
      }, { transaction });

      await transaction.commit();
      return license;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get license statistics
   */
  static async getLicenseStatistics() {
    try {
      const statistics = await MiningLicense.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      const expiringCount = await this.getExpiringLicenses().then(licenses => licenses.length);

      return {
        byStatus: statistics,
        expiringCount,
        // Add more statistics as needed
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search licenses
   */
  static async searchLicenses(searchTerm) {
    try {
      return await MiningLicense.findAll({
        where: {
          [Op.or]: [
            { license_number: { [Op.like]: `%${searchTerm}%` } },
            { district: { [Op.like]: `%${searchTerm}%` } }
          ]
        },
        order: [['created_at', 'DESC']]
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MiningLicenseService;