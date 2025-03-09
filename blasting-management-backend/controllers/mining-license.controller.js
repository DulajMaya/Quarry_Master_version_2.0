// controllers/mining-license.controller.js
const MiningLicenseService = require('../services/mining-license.service');
const {ResponseUtil, formatResponse} = require('../utils/response');
const fs = require('fs');
class MiningLicenseController {
  /**
   * Create new license
   */
  /*static async create(req, res) {
    try {
      const exists = await MiningLicenseService.checkLicenseNumberExists(req.body.license_number);
      if (exists) {
        return ResponseUtil.badRequestResponse(res, "License number already exists");
      }

      // Add created_by if you're tracking user actions
      /*const licenseData = {
        ...req.body,
        created_by: req.user.id // Assuming you have user data from auth middleware
      };

      const license = await MiningLicenseService.createLicense(req.body);
      return ResponseUtil.successResponse(res, 201, "License created successfully", license);
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error creating license", error);
    }
  }*/
    static async create(req, res) {
        try {
          
          if (req.file) {
            // Store the relative path in database
            console.log('yes')
            req.body.license_photo_url = `/uploads/licenses/${req.file.filename}`;
            console.log('Photo URL:', req.body.license_photo_url);
          }
    
          const exists = await MiningLicenseService.checkLicenseNumberExists(req.body.license_number);
          if (exists) {
            // Delete uploaded file if license number exists
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return ResponseUtil.badRequestResponse(res, "License number already exists");
          }
    
          const license = await MiningLicenseService.createLicense(req.body);
          return formatResponse(res, 201, "License created successfully", license);
        } catch (error) {
          // Delete uploaded file if error occurs
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return ResponseUtil.errorResponse(res, 500, "Error creating license", error);
        }
      }
    

       /**
     * Get license by mining site ID
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    static async getLicenseByMiningId(req, res) {
      try {
          const miningId = req.params.miningId;
          const license = await MiningLicenseService.getLicenseByMiningId(miningId);
          
          res.status(200).json({
              success: true,
              data: {
                  id: license.id,
                  license_number: license.license_number,
                  issue_date: license.issue_date,
                  end_date: license.end_date,
                  district: license.district,
                  license_photo_url: license.license_photo_url,
                  max_hole_per_blast: license.max_hole_per_blast,
                  max_blasts_per_day: license.max_blasts_per_day,
                  max_depth_of_hole: license.max_depth_of_hole,
                  max_spacing: license.max_spacing,
                  max_burden: license.max_burden,
                  max_watergel_per_hole: license.max_watergel_per_hole,
                  max_anfo_per_hole: license.max_anfo_per_hole,
                  third_party_monitoring_required: license.third_party_monitoring_required,
                  status: license.status,
                  created_at: license.created_at,
                  updated_at: license.updated_at
              }
          });
      } catch (error) {
          res.status(404).json({
              success: false,
              message: error.message
          });
      }
  }

  /**
   * Get all licenses with filters and pagination
   */
  static async getAllLicenses(req, res) {
    try {
      const filters = {
        status: req.query.status,
        district: req.query.district,
        search: req.query.search,
        page: req.query.page || 1,
        limit: req.query.limit || 10
      };

      const { rows: licenses, count: total } = await MiningLicenseService.getAllLicenses(filters);
      
      return formatResponse(res, 200, "Licenses retrieved successfully", {
        licenses,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error retrieving licenses", error);
    }
  }

  /**
   * Get license by ID
   */
  static async getLicenseById(req, res) {
    try {
      const license = await MiningLicenseService.getLicenseById(req.params.id, true);
      if (!license) {
        return ResponseUtil.notFoundResponse(res, "License not found");
      }
      return formatResponse(res, 200, "License retrieved successfully", license);
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error retrieving license", error);
    }
  }

  /**
   * Update license
   */
  /*static async update(req, res) {
    try {
      // Check if license exists
      const exists = await MiningLicenseService.getLicenseById(req.params.id);
      if (!exists) {
        return ResponseUtil.notFoundResponse(res, "License not found");
      }

      // Check license number uniqueness if it's being updated
      if (req.body.license_number && req.body.license_number !== exists.license_number) {
        const numberExists = await MiningLicenseService.checkLicenseNumberExists(
          req.body.license_number,
          req.params.id
        );
        if (numberExists) {
          return ResponseUtil.badRequestResponse(res, "License number already exists");
        }
      }

      // Add updated_by if you're tracking user actions
      const updateData = {
        ...req.body,
        updated_by: req.user.id
      };

      const license = await MiningLicenseService.updateLicense(req.params.id, updateData);
      return ResponseUtil.successResponse(res, 200, "License updated successfully", license);
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error updating license", error);
    }
  }*/

    static async update(req, res) {
        try {
          const existingLicense = await MiningLicenseService.getLicenseById(req.params.id);
          if (!existingLicense) {
            if (req.file) {
              fs.unlinkSync(req.file.path);
            }
            return ResponseUtil.notFoundResponse(res, "License not found");
          }
    
          // Handle file upload
          if (req.file) {
            // Delete old photo if exists
            if (existingLicense.license_photo_url) {
              const oldPath = path.join(__dirname, '..', existingLicense.license_photo_url);
              if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
              }
            }
            req.body.license_photo_url = `/uploads/licenses/${req.file.filename}`;
          }
    
          const license = await MiningLicenseService.updateLicense(req.params.id, req.body);
          return formatResponse(res, 200, "License updated successfully", license);
        } catch (error) {
          // Delete uploaded file if error occurs
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return ResponseUtil.errorResponse(res, 500, "Error updating license", error);
        }
      }

      static async deletePhoto(req, res) {
        try {
          const license = await MiningLicenseService.getLicenseById(req.params.id);
          if (!license) {
            return ResponseUtil.notFoundResponse(res, "License not found");
          }
    
          if (!license.license_photo_url) {
            return ResponseUtil.badRequestResponse(res, "No photo exists for this license");
          }
    
          const filePath = path.join(__dirname, '..', license.license_photo_url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
    
          await MiningLicenseService.updateLicense(req.params.id, { license_photo_url: null });
          return formatResponse(res, 200, "License photo deleted successfully");
        } catch (error) {
          console.error('Error deleting license photo:', error);
          return ResponseUtil.errorResponse(res, 500, "Error deleting license photo", error);
        }
      }

  /**
   * Delete license
   */
  static async delete(req, res) {
    try {
      const deleted = await MiningLicenseService.deleteLicense(req.params.id);
      if (!deleted) {
        return ResponseUtil.notFoundResponse(res, "License not found");
      }
      return formatResponse(res, 200, "License deleted successfully");
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error deleting license", error);
    }
  }

  /**
   * Get expiring licenses
   */
  static async getExpiringLicenses(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const licenses = await MiningLicenseService.getExpiringLicenses(days);
      return formatResponse(
        res, 
        200, 
        `Licenses expiring in next ${days} days retrieved successfully`,
        licenses
      );
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error retrieving expiring licenses", error);
    }
  }

  /**
   * Update license status
   */
  static async updateStatus(req, res) {
    try {
      const { status, reason } = req.body;
      const license = await MiningLicenseService.updateLicenseStatus(
        req.params.id,
        status,
        reason
      );
      return formatResponse(res, 200, "License status updated successfully", license);
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error updating license status", error);
    }
  }

  /**
   * Get license statistics
   */
  static async getStatistics(req, res) {
    try {
      const statistics = await MiningLicenseService.getLicenseStatistics();
      return formatResponse(res, 200, "License statistics retrieved successfully", statistics);
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error retrieving license statistics", error);
    }
  }

  /**
   * Search licenses
   */
  static async search(req, res) {
    try {
      const { term } = req.query;
      if (!term) {
        return ResponseUtil.badRequestResponse(res, "Search term is required");
      }
      const licenses = await MiningLicenseService.searchLicenses(term);
      return formatResponse(res, 200, "Search results retrieved successfully", licenses);
    } catch (error) {
      return ResponseUtil.errorResponse(res, 500, "Error searching licenses", error);
    }
  }
}

module.exports = MiningLicenseController;