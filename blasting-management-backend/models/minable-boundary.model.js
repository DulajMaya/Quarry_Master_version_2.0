// models/minable-boundary.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const coordinateService = require('../services/coordinate-conversion.service');

const MinableBoundary = sequelize.define('MinableBoundary', {
    boundary_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    mining_site_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'MiningSites', // References the MiningSite model
            key: 'site_id'
        }
    },
    license_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'mining_licenses', // References the License model
            key: 'id'
        }
    },
    point_sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Order of points in the boundary polygon'
    },
    kadawala_north: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false,
        validate: {
            isValid(value) {
                coordinateService.validateKadawalaCoordinates(value, this.kadawala_east);
            }
        }
    },
    kadawala_east: {
        type: DataTypes.DECIMAL(12, 6),
        allowNull: false
    },
    wgs84_latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    wgs84_longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'minable_boundaries',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

// Hooks for coordinate conversion
MinableBoundary.beforeValidate(async (boundary) => {
    if (boundary.kadawala_north && boundary.kadawala_east) {
        const wgs84Coords = coordinateService.kadawalaToWGS84(
            boundary.kadawala_north,
            boundary.kadawala_east
        );
        boundary.wgs84_latitude = wgs84Coords.latitude;
        boundary.wgs84_longitude = wgs84Coords.longitude;
    }
});

// Static methods
class MinableBoundaryClass {
    static async createBoundaryPoint(boundaryData) {
        try {
            return await MinableBoundary.create(boundaryData);
        } catch (error) {
            throw error;
        }
    }

    static async getBoundaryPoints(siteId) {
        try {
            return await MinableBoundary.findAll({
                where: {
                    mining_site_id: siteId,
                    is_active: true
                },
                order: [['point_sequence', 'ASC']]
            });
        } catch (error) {
            throw error;
        }
    }

    static async updateBoundaryPoint(boundaryId, updateData) {
        try {
            const point = await MinableBoundary.findByPk(boundaryId);
            if (!point) {
                throw { kind: "not_found" };
            }
            return await point.update(updateData);
        } catch (error) {
            throw error;
        }
    }

    static async deleteBoundaryPoint(boundaryId) {
        try {
            const point = await MinableBoundary.findByPk(boundaryId);
            if (!point) {
                throw { kind: "not_found" };
            }
            await point.update({ is_active: false });
            return true;
        } catch (error) {
            throw error;
        }
    }
}

// Add static methods to model
Object.assign(MinableBoundary, MinableBoundaryClass);

module.exports = MinableBoundary;