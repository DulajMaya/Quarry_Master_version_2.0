const { ExplosiveType } = require('../models');
const { Op } = require('sequelize');
const { generateExplosiveTypeId } = require('./id-generator.service');

exports.createExplosiveType = async (data) => {
    try {
        const explosiveTypeId = await generateExplosiveTypeId();
        
        const explosiveType = await ExplosiveType.create({
            ExplosiveTypeID: explosiveTypeId,
            TypeName: data.typeName,
            Description: data.description,
            UnitOfMeasurement: data.unitOfMeasurement,
            Status: 'Active'
        });

        return explosiveType;
    } catch (error) {
        throw error;
    }
};

exports.updateExplosiveType = async (explosiveTypeId, updateData) => {
    try {
        const explosiveType = await ExplosiveType.findByPk(explosiveTypeId);
        
        if (!explosiveType) {
            throw { status: 404, message: 'Explosive type not found' };
        }

        await explosiveType.update({
            TypeName: updateData.typeName,
            Description: updateData.description,
            UnitOfMeasurement: updateData.unitOfMeasurement
        });

        return explosiveType;
    } catch (error) {
        throw error;
    }
};

exports.getExplosiveType = async (explosiveTypeId) => {
    try {
        const explosiveType = await ExplosiveType.findByPk(explosiveTypeId);
        
        if (!explosiveType) {
            throw { status: 404, message: 'Explosive type not found' };
        }

        return explosiveType;
    } catch (error) {
        throw error;
    }
};

exports.getAllExplosiveTypes = async (filters = {}, pagination = {}) => {
    try {
        const { status, search } = filters;
        const { page = 1, limit = 10 } = pagination;

        const whereClause = {};
        
        if (status) {
            whereClause.Status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { TypeName: { [Op.like]: `%${search}%` } },
                { Description: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await ExplosiveType.findAndCountAll({
            where: whereClause,
            offset: (page - 1) * limit,
            limit: parseInt(limit),
            order: [['CreatedAt', 'DESC']]
        });

        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            explosiveTypes: rows
        };
    } catch (error) {
        throw error;
    }
};

exports.changeExplosiveTypeStatus = async (explosiveTypeId, status) => {
    try {
        const explosiveType = await ExplosiveType.findByPk(explosiveTypeId);
        
        if (!explosiveType) {
            throw { status: 404, message: 'Explosive type not found' };
        }

        // Check if type is in use before deactivating
        if (status === 'Inactive') {
            // Add logic to check if explosive type is being used
            // in permits, quotas, or inventory
        }

        await explosiveType.update({ Status: status });
        return explosiveType;
    } catch (error) {
        throw error;
    }
};

exports.validateExplosiveType = async (data) => {
    const errors = [];

    if (!data.typeName) {
        errors.push('Type name is required');
    }

    if (!data.unitOfMeasurement) {
        errors.push('Unit of measurement is required');
    }

    // Check if type name already exists
    if (data.typeName) {
        const existing = await ExplosiveType.findOne({
            where: { TypeName: data.typeName }
        });
        if (existing) {
            errors.push('Type name already exists');
        }
    }

    return errors;
};