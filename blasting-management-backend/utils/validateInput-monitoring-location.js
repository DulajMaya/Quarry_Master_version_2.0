// utils/validateInput-monitoring.js

const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^(?:(?:\+94)|(?:94)|0)(?:7[0-9]|11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91|70|71|72|74|75|76|77|78|75|76|77|78|91|92)[0-9]{7}$/;
    return !phone || phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return !email || emailRegex.test(email);
};

const validateCreateMonitoringLocation = (data) => {
    const errors = [];

    // Required fields
    if (!data.site_id) {
        errors.push('Site ID is required');
    }

    if (!data.kadawala_gps_north || !data.kadawala_gps_east) {
        errors.push('Both Kadawala GPS coordinates are required');
    }

    if (!data.owners_name) {
        errors.push('Owner\'s name is required');
    }

    if (!data.address) {
        errors.push('Address is required');
    }

    // Optional fields validation
    if (data.telephone_number && !isValidPhoneNumber(data.telephone_number)) {
        errors.push('Invalid Sri Lankan telephone number format');
    }

    if (data.email_address && !isValidEmail(data.email_address)) {
        errors.push('Invalid email address format');
    }

    // Coordinate validation
    if (data.kadawala_gps_north) {
        if (data.kadawala_gps_north < 160000 || data.kadawala_gps_north > 940000) {
            errors.push('Kadawala GPS North coordinate is out of valid range');
        }
    }

    if (data.kadawala_gps_east) {
        if (data.kadawala_gps_east < 130000 || data.kadawala_gps_east > 860000) {
            errors.push('Kadawala GPS East coordinate is out of valid range');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateUpdateMonitoringLocation = (data) => {
    const errors = [];

    if (data.kadawala_gps_north || data.kadawala_gps_east) {
        if (data.kadawala_gps_north && (data.kadawala_gps_north < 160000 || data.kadawala_gps_north > 940000)) {
            errors.push('Kadawala GPS North coordinate is out of valid range');
        }
        if (data.kadawala_gps_east && (data.kadawala_gps_east < 130000 || data.kadawala_gps_east > 860000)) {
            errors.push('Kadawala GPS East coordinate is out of valid range');
        }
    }

    if (data.telephone_number && !isValidPhoneNumber(data.telephone_number)) {
        errors.push('Invalid Sri Lankan telephone number format');
    }

    if (data.email_address && !isValidEmail(data.email_address)) {
        errors.push('Invalid email address format');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateBulkMonitoringLocations = (locations) => {
    if (!Array.isArray(locations)) {
        return {
            isValid: false,
            errors: ['Invalid data format: expected an array of locations']
        };
    }

    const errors = [];
    locations.forEach((location, index) => {
        const validation = validateCreateMonitoringLocation(location);
        if (!validation.isValid) {
            errors.push({
                index: index,
                location: `Location ${index + 1}`,
                errors: validation.errors
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

module.exports = {
    validateCreateMonitoringLocation,
    validateUpdateMonitoringLocation,
    validateBulkMonitoringLocations,
    isValidPhoneNumber,
    isValidEmail
};