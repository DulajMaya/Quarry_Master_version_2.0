// models/mining-license.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const MiningLicense = sequelize.define('MiningLicense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  license_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  issue_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  district: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  license_photo_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  max_hole_per_blast: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_blasts_per_day: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  max_depth_of_hole: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_spacing: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_burden: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_watergel_per_hole: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  max_anfo_per_hole: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  third_party_monitoring_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'suspended', 'revoked'),
    defaultValue: 'active'
  }
}, {
  tableName: 'mining_licenses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Static methods using Sequelize
class MiningLicenseClass {
  static async create(licenseData) {
    try {
      return await MiningLicense.create(licenseData);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await MiningLicense.findByPk(id);
    } catch (error) {
      throw error;
    }
  }

  static async getAll(options = {}) {
    try {
      return await MiningLicense.findAll(options);
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, licenseData) {
    try {
      const license = await MiningLicense.findByPk(id);
      if (!license) {
        throw { kind: "not_found" };
      }
      return await license.update(licenseData);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const license = await MiningLicense.findByPk(id);
      if (!license) {
        throw { kind: "not_found" };
      }
      await license.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Additional useful methods
  static async findByLicenseNumber(licenseNumber) {
    try {
      return await MiningLicense.findOne({
        where: { license_number: licenseNumber }
      });
    } catch (error) {
      throw error;
    }
  }

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
        }
      });
    } catch (error) {
      throw error;
    }
  }
}

// Add the static methods to the model
Object.assign(MiningLicense, MiningLicenseClass);

module.exports = MiningLicense;