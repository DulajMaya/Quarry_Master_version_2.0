const { ExplosiveDealer, User, Role, Purchase } = require('../models');
const { generateDealerId } = require('./id-generator.service');
const authService = require('./auth.service');
const { Op } = require('sequelize');

exports.createExplosiveDealer = async (dealerData, userData, transaction) => {
    try {
        const dealerId = await generateDealerId();
        
        // Create Explosive Dealer
        const dealer = await ExplosiveDealer.create({
            DealerID: dealerId,
            Name: dealerData.name,
            NIC: dealerData.nic,
            Address: dealerData.address,
            District: dealerData.district,
            ContactNumber: dealerData.contactNumber,
            Email: dealerData.email,
            LicenseNumber: dealerData.licenseNumber,
            Status: 'Active'
        }, { transaction });

        // Create User Account
        const user = await authService.signup({
            username: userData.username,
            password: userData.password,
            email: userData.email,
            roleId: 4, // ROLE_EXPLOSIVE_DEALER
            referenceId: dealerId,
            referenceType: 'EXPLOSIVE_DEALER'
        }, transaction);

        return { dealer, user };
    } catch (error) {
        throw error;
    }
};

exports.updateExplosiveDealer = async (dealerId, updateData, transaction) => {
    try {
        const dealer = await ExplosiveDealer.findByPk(dealerId);
        if (!dealer) {
            throw { status: 404, message: 'Explosive Dealer not found' };
        }

        // Update dealer details
        await dealer.update({
            Name: updateData.name,
            Address: updateData.address,
            District: updateData.district,
            ContactNumber: updateData.contactNumber,
            Email: updateData.email,
            LicenseNumber: updateData.licenseNumber
        }, { transaction });

        // If email is updated, update user account too
        if (updateData.email) {
            await User.update(
                { email: updateData.email },
                { 
                    where: { 
                        reference_id: dealerId,
                        reference_type: 'EXPLOSIVE_DEALER'
                    },
                    transaction 
                }
            );
        }

        return dealer;
    } catch (error) {
        throw error;
    }
};

exports.getExplosiveDealer = async (dealerId) => {
    try {
        return await ExplosiveDealer.findOne({
            where: { DealerID: dealerId },
            include: [{
                model: User,
                attributes: ['username', 'email', 'status'],
                include: [{ 
                    model: Role,
                    attributes: ['name']
                }]
            }]
        });
    } catch (error) {
        throw error;
    }
};

exports.getAllExplosiveDealers = async (filters = {}, pagination = {}) => {
    try {
        const { status, district, search } = filters;
        const { page = 1, limit = 10 } = pagination;

        const whereClause = {};
        if (status) whereClause.Status = status;
        if (district) whereClause.District = district;
        if (search) {
            whereClause[Op.or] = [
                { Name: { [Op.like]: `%${search}%` } },
                { Email: { [Op.like]: `%${search}%` } },
                { LicenseNumber: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await ExplosiveDealer.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                attributes: ['username', 'email', 'status'],
                include: [{ 
                    model: Role,
                    attributes: ['name']
                }]
            }],
            offset: (page - 1) * limit,
            limit: parseInt(limit),
            order: [['CreatedAt', 'DESC']]
        });

        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            dealers: rows
        };
    } catch (error) {
        throw error;
    }
};

exports.getDealersByDistrict = async (district) => {
    try {
        return await ExplosiveDealer.findAll({
            where: { 
                District: district,
                Status: 'Active'
            },
            include: [{
                model: User,
                attributes: ['username', 'email', 'status']
            }]
        });
    } catch (error) {
        throw error;
    }
};

exports.changeDealerStatus = async (dealerId, status) => {
    try {
        const dealer = await ExplosiveDealer.findByPk(dealerId);
        if (!dealer) {
            throw { status: 404, message: 'Explosive Dealer not found' };
        }

        await dealer.update({ Status: status });

        // Update associated user account status
        await User.update(
            { status: status === 'Active' },
            { 
                where: { 
                    reference_id: dealerId,
                    reference_type: 'EXPLOSIVE_DEALER'
                }
            }
        );

        return dealer;
    } catch (error) {
        throw error;
    }
};

exports.deleteExplosiveDealer = async (dealerId) => {
    const transaction = await sequelize.transaction();
    try {
        const dealer = await ExplosiveDealer.findByPk(dealerId);
        if (!dealer) {
            throw { status: 404, message: 'Explosive Dealer not found' };
        }

        // Check for active purchases
        const activePurchases = await Purchase.count({
            where: {
                DealerID: dealerId,
                Status: 'Pending'
            }
        });

        if (activePurchases > 0) {
            throw { 
                status: 400, 
                message: 'Cannot delete dealer with pending purchases' 
            };
        }

        // Deactivate instead of delete
        await dealer.update({ 
            Status: 'Inactive' 
        }, { transaction });

        // Deactivate user account
        await User.update(
            { status: false },
            { 
                where: { 
                    reference_id: dealerId,
                    reference_type: 'EXPLOSIVE_DEALER'
                },
                transaction 
            }
        );

        await transaction.commit();
        return { message: 'Explosive Dealer deactivated successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

exports.getDealerSummary = async (dealerId) => {
    try {
        const dealer = await ExplosiveDealer.findByPk(dealerId);
        if (!dealer) {
            throw { status: 404, message: 'Explosive Dealer not found' };
        }

        // Get purchase statistics
        const purchaseStats = await Purchase.findAll({
            where: { DealerID: dealerId },
            attributes: [
                'Status',
                [sequelize.fn('COUNT', sequelize.col('PurchaseID')), 'count']
            ],
            group: ['Status']
        });

        return {
            dealer,
            statistics: {
                purchases: purchaseStats
            }
        };
    } catch (error) {
        throw error;
    }
};

exports.validateExplosiveDealer = async (data) => {
    const errors = [];

    if (!data.name || data.name.length < 3) {
        errors.push('Name must be at least 3 characters long');
    }

    if (!data.nic || !/^[0-9]{9}[vVxX]$/.test(data.nic)) {
        errors.push('Invalid NIC format');
    }

    if (!data.district) {
        errors.push('District is required');
    }

    if (!data.licenseNumber) {
        errors.push('License number is required');
    }

    if (!data.contactNumber || !/^[0-9]{10}$/.test(data.contactNumber)) {
        errors.push('Invalid contact number format');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Invalid email format');
    }

    // Check if license number is already in use
    if (data.licenseNumber) {
        const existingDealer = await ExplosiveDealer.findOne({
            where: { LicenseNumber: data.licenseNumber }
        });
        if (existingDealer) {
            errors.push('License number is already registered');
        }
    }

    return errors;
};