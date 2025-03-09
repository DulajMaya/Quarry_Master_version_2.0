// utils/validateInput-miningsite.js

// Helper functions for validation
const isValidCoordinate = (coord) => {
    return typeof coord === 'number' && !isNaN(coord) && coord !== 0;
};

const isValidString = (str, minLength = 2, maxLength = 255) => {
    return typeof str === 'string' && str.length >= minLength && str.length <= maxLength;
};

const isValidDistrict = (district) => {
    const validDistricts = [
        'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
        'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
        'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
        'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
        'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];
    return validDistricts.includes(district);
};

// Main validation functions
const validateCreateSite = (data) => {
    const errors = [];

    // License ID validation
    if (!data.license_id || typeof data.license_id !== 'number' || data.license_id <= 0) {
        errors.push('Valid license_id is required');
    }

    // Site name validation
    if (!isValidString(data.site_name, 2, 100)) {
        errors.push('Site name must be between 2 and 100 characters');
    }

    // Address validation
    if (!isValidString(data.site_address, 5, 500)) {
        errors.push('Site address must be between 5 and 500 characters');
    }

    // District validation
    if (!data.site_district || !isValidDistrict(data.site_district)) {
        errors.push('Valid Sri Lankan district is required');
    }

    // Mining engineer validation
    if (!isValidString(data.site_mining_engineer, 2, 100)) {
        errors.push('Valid mining engineer name is required (2-100 characters)');
    }

    // Coordinate validations
    if (!isValidCoordinate(data.site_kadawala_gps_north)) {
        errors.push('Valid kadawala GPS north coordinate is required');
    }

    if (!isValidCoordinate(data.site_kadawala_gps_east)) {
        errors.push('Valid kadawala GPS east coordinate is required');
    }

    // Additional coordinate range validations (adjust ranges as per Kadawala system)
    if (data.site_kadawala_gps_north) {
        if (data.site_kadawala_gps_north < 100000 || data.site_kadawala_gps_north > 940000) {
            errors.push('Kadawala GPS north coordinate out of valid range');
        }
    }

    if (data.site_kadawala_gps_east) {
        if (data.site_kadawala_gps_east < 100000 || data.site_kadawala_gps_east > 860000) {
            errors.push('Kadawala GPS east coordinate out of valid range');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateUpdateSite = (data) => {
    const errors = [];

    // Optional field validations for update
    if (data.site_name !== undefined && !isValidString(data.site_name, 2, 100)) {
        errors.push('Site name must be between 2 and 100 characters');
    }

    if (data.site_address !== undefined && !isValidString(data.site_address, 5, 500)) {
        errors.push('Site address must be between 5 and 500 characters');
    }

    if (data.site_district !== undefined && !isValidDistrict(data.site_district)) {
        errors.push('Valid Sri Lankan district is required');
    }

    if (data.site_mining_engineer !== undefined && 
        !isValidString(data.site_mining_engineer, 2, 100)) {
        errors.push('Valid mining engineer name is required (2-100 characters)');
    }

    // Coordinate validations if provided
    if (data.site_kadawala_gps_north !== undefined) {
        if (!isValidCoordinate(data.site_kadawala_gps_north)) {
            errors.push('Valid kadawala GPS north coordinate is required');
        } else if (data.site_kadawala_gps_north < 160000 || data.site_kadawala_gps_north > 940000) {
            errors.push('Kadawala GPS north coordinate out of valid range');
        }
    }

    if (data.site_kadawala_gps_east !== undefined) {
        if (!isValidCoordinate(data.site_kadawala_gps_east)) {
            errors.push('Valid kadawala GPS east coordinate is required');
        } else if (data.site_kadawala_gps_east < 130000 || data.site_kadawala_gps_east > 860000) {
            errors.push('Kadawala GPS east coordinate out of valid range');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateSearchQuery = (query) => {
    const errors = [];

    if (query.searchTerm && !isValidString(query.searchTerm, 1, 100)) {
        errors.push('Search term must be between 1 and 100 characters');
    }

    if (query.district && !isValidDistrict(query.district)) {
        errors.push('Invalid district provided');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

module.exports = {
    validateCreateSite,
    validateUpdateSite,
    validateSearchQuery,
    isValidDistrict,
    isValidCoordinate
};