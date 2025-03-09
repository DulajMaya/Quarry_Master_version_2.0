const { ExplosiveStore, StoreInventory, MiningSite } = require('../models');
const { generateStoreId } = require('../services/id-generator.service');
const { Op } = require('sequelize');

exports.createExplosiveStore = async (storeData) => {
    try {
        const storeId = await generateStoreId();

        // Verify mining site exists
        const miningSite = await MiningSite.findByPk(storeData.miningSiteId);
        if (!miningSite) {
            throw { status: 404, message: 'Mining site not found' };
        }

        // Check if site already has a store
        const existingStore = await ExplosiveStore.findOne({
            where: { MiningSiteID: storeData.miningSiteId }
        });
        if (existingStore) {
            throw { status: 400, message: 'Mining site already has an explosive store' };
        }

        const store = await ExplosiveStore.create({
            StoreID: storeId,
            MiningSiteID: storeData.miningSiteId,
            StoreName: storeData.storeName,
            LicenseNumber: storeData.licenseNumber,
            LicenseExpiryDate: storeData.licenseExpiryDate,
            ContactPerson: storeData.contactPerson,
            ContactNumber: storeData.contactNumber,
            Location: storeData.location,
            Capacity: storeData.capacity,
            Status: 'Active'
        });

        return store;
    } catch (error) {
        throw error;
    }
};

exports.updateExplosiveStore = async (storeId, updateData) => {
    try {
        const store = await ExplosiveStore.findByPk(storeId);
        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }

        await store.update({
            StoreName: updateData.storeName,
            LicenseNumber: updateData.licenseNumber,
            LicenseExpiryDate: updateData.licenseExpiryDate,
            ContactPerson: updateData.contactPerson,
            ContactNumber: updateData.contactNumber,
            Location: updateData.location,
            Capacity: updateData.capacity
        });

        return store;
    } catch (error) {
        throw error;
    }
};

exports.getExplosiveStore = async (storeId) => {
    try {
        const store = await ExplosiveStore.findOne({
            where: { StoreID: storeId },
            include: [
                {
                    model: MiningSite,
                    attributes: ['site_name', 'site_address']
                },
                {
                    model: StoreInventory,
                    include: ['ExplosiveType']
                }
            ]
        });

        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }

        return store;
    } catch (error) {
        throw error;
    }
};

exports.getAllExplosiveStores = async (filters = {}, pagination = {}) => {
    try {
        const { status, miningSiteId, search } = filters;
        const { page = 1, limit = 10 } = pagination;

        const whereClause = {};
        if (status) whereClause.Status = status;
        if (miningSiteId) whereClause.MiningSiteID = miningSiteId;
        if (search) {
            whereClause[Op.or] = [
                { StoreName: { [Op.like]: `%${search}%` } },
                { LicenseNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await ExplosiveStore.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: MiningSite,
                    attributes: ['site_name']
                }
            ],
            offset: (page - 1) * limit,
            limit: parseInt(limit),
            order: [['CreatedAt', 'DESC']]
        });

        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            stores: rows
        };
    } catch (error) {
        throw error;
    }
};

exports.changeStoreStatus = async (storeId, status) => {
    try {
        const store = await ExplosiveStore.findByPk(storeId);
        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }

        // Check if store has existing inventory before deactivating
        if (status === 'Inactive') {
            const hasInventory = await StoreInventory.findOne({
                where: {
                    StoreID: storeId,
                    CurrentQuantity: {
                        [Op.gt]: 0
                    }
                }
            });

            if (hasInventory) {
                throw { 
                    status: 400, 
                    message: 'Cannot deactivate store with existing inventory' 
                };
            }
        }

        await store.update({ Status: status });
        return store;
    } catch (error) {
        throw error;
    }
};

exports.getStoreSummary = async (storeId) => {
    try {
        const store = await ExplosiveStore.findOne({
            where: { StoreID: storeId },
            include: [
                {
                    model: StoreInventory,
                    include: ['ExplosiveType']
                }
            ]
        });

        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }

        // Calculate capacity utilization
        const totalInventory = store.StoreInventories.reduce(
            (sum, inv) => sum + inv.CurrentQuantity, 0
        );

        return {
            store: {
                id: store.StoreID,
                name: store.StoreName,
                status: store.Status
            },
            inventory: store.StoreInventories,
            capacityUtilization: (totalInventory / store.Capacity) * 100,
            licenseStatus: {
                number: store.LicenseNumber,
                expiryDate: store.LicenseExpiryDate,
                isExpired: new Date(store.LicenseExpiryDate) < new Date()
            }
        };
    } catch (error) {
        throw error;
    }
};

exports.validateStore = async (data) => {
    const errors = [];

    if (!data.storeName || data.storeName.length < 3) {
        errors.push('Store name must be at least 3 characters long');
    }

    if (!data.licenseNumber) {
        errors.push('License number is required');
    }

    if (!data.capacity || data.capacity <= 0) {
        errors.push('Valid capacity is required');
    }

    if (!data.licenseExpiryDate || new Date(data.licenseExpiryDate) < new Date()) {
        errors.push('Valid license expiry date is required');
    }

    // Check if license number already exists
    if (data.licenseNumber) {
        const existing = await ExplosiveStore.findOne({
            where: { LicenseNumber: data.licenseNumber }
        });
        if (existing) {
            errors.push('License number already exists');
        }
    }

    return errors;
};

// Add to explosive-store.service.js

exports.checkStoreLicenseStatus = async () => {
    try {
        const expiringStores = await ExplosiveStore.findAll({
            where: {
                Status: 'Active',
                LicenseExpiryDate: {
                    [Op.between]: [
                        new Date(),
                        new Date(new Date().setDate(new Date().getDate() + 30))
                    ]
                }
            },
            include: [{
                model: MiningSite,
                attributes: ['SiteName']
            }]
        });

        return expiringStores;
    } catch (error) {
        throw error;
    }
};

exports.getStoreCapacityUtilization = async (storeId) => {
    try {
        const store = await ExplosiveStore.findByPk(storeId, {
            include: [{
                model: StoreInventory,
                attributes: ['CurrentQuantity']
            }]
        });

        if (!store) {
            throw { status: 404, message: 'Store not found' };
        }

        const totalInventory = store.StoreInventories.reduce(
            (sum, inv) => sum + Number(inv.CurrentQuantity), 0
        );

        return {
            totalCapacity: store.Capacity,
            currentUtilization: totalInventory,
            utilizationPercentage: (totalInventory / store.Capacity) * 100,
            remainingCapacity: store.Capacity - totalInventory
        };
    } catch (error) {
        throw error;
    }
};

exports.validateStoreCapacity = async (storeId, additionalQuantity) => {
    try {
        const { totalCapacity, currentUtilization } = 
            await this.getStoreCapacityUtilization(storeId);

        const newUtilization = currentUtilization + additionalQuantity;

        if (newUtilization > totalCapacity) {
            throw {
                status: 400,
                message: 'Exceeds store capacity',
                details: {
                    currentUtilization,
                    requestedAddition: additionalQuantity,
                    availableCapacity: totalCapacity - currentUtilization
                }
            };
        }

        return true;
    } catch (error) {
        throw error;
    }
};

exports.getSiteStore = async (siteId) => {
    try {
        const store = await ExplosiveStore.findOne({
            where: { MiningSiteID: siteId },
            include: [
                {
                    model: MiningSite,
                    attributes: ['site_name', 'site_address']
                },
                {
                    model: StoreInventory,
                    include: ['ExplosiveType']
                }
                    
                
            ]
        });

        if (!store) {
            throw { status: 404, message: 'No explosive store found for this mining site' };
        }

        return store;
    } catch (error) {
        throw error;
    }
};