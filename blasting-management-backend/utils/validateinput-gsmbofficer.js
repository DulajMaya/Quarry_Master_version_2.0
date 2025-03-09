// utils/validateInput-gsmbofficer.js

// Helper functions
const isValidPhoneNumber = (phone) => {
    // Validate Sri Lankan phone numbers
    // Formats: +94XXXXXXXXX, 94XXXXXXXXX, 0XXXXXXXXX
    const phoneRegex = /^(?:(?:\+94)|(?:94)|0)(?:7[0-9]|11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91|70|71|72|74|75|76|77|78|75|76|77|78|91|92)[0-9]{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

const isValidEmail = (email) => {
    // Basic email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

const isValidName = (name) => {
    // Name should contain only letters, spaces, dots, and hyphens
    // Minimum 3 characters, maximum 100 characters
    const nameRegex = /^[a-zA-Z\s.-]{3,100}$/;
    return nameRegex.test(name);
};

// Main validation functions
const validateCreateGSMBOfficer = (data) => {
    const errors = [];

    // Name validation
    if (!data.name) {
        errors.push('Name is required');
    } else if (!isValidName(data.name)) {
        errors.push('Name should contain only letters, spaces, dots, and hyphens (3-100 characters)');
    }

    // Phone number validation
    if (!data.telephone_number) {
        errors.push('Telephone number is required');
    } else if (!isValidPhoneNumber(data.telephone_number)) {
        errors.push('Invalid Sri Lankan telephone number format');
    }

    // Email validation
    if (!data.email_address) {
        errors.push('Email address is required');
    } else if (!isValidEmail(data.email_address)) {
        errors.push('Invalid email address format');
    } else if (!data.email_address.toLowerCase().endsWith('@gsmb.gov.lk')) {
        errors.push('Email must be a valid GSMB email address (@gsmb.gov.lk)');
    }

    // Additional optional fields validation
    if (data.designation && typeof data.designation !== 'string') {
        errors.push('Designation must be text');
    }

    if (data.nic && !/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(data.nic)) {
        errors.push('Invalid NIC format');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateUpdateGSMBOfficer = (data) => {
    const errors = [];

    // Only validate fields that are present in the update data
    if (data.name !== undefined) {
        if (!isValidName(data.name)) {
            errors.push('Name should contain only letters, spaces, dots, and hyphens (3-100 characters)');
        }
    }

    if (data.telephone_number !== undefined) {
        if (!isValidPhoneNumber(data.telephone_number)) {
            errors.push('Invalid Sri Lankan telephone number format');
        }
    }

    if (data.email_address !== undefined) {
        if (!isValidEmail(data.email_address)) {
            errors.push('Invalid email address format');
        } else if (!data.email_address.toLowerCase().endsWith('@gsmb.gov.lk')) {
            errors.push('Email must be a valid GSMB email address (@gsmb.gov.lk)');
        }
    }

    if (data.designation !== undefined && typeof data.designation !== 'string') {
        errors.push('Designation must be text');
    }

    if (data.nic !== undefined && !/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(data.nic)) {
        errors.push('Invalid NIC format');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateBulkGSMBOfficers = (officers) => {
    if (!Array.isArray(officers)) {
        return {
            isValid: false,
            errors: ['Invalid data format: expected an array of officers']
        };
    }

    const errors = [];
    officers.forEach((officer, index) => {
        const validation = validateCreateGSMBOfficer(officer);
        if (!validation.isValid) {
            errors.push({
                index: index,
                officer: officer.name || `Officer ${index + 1}`,
                errors: validation.errors
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateOfficerDeactivation = (data) => {
    const errors = [];

    if (typeof data.is_active !== 'boolean') {
        errors.push('Active status must be a boolean value');
    }

    if (data.deactivation_reason) {
        if (typeof data.deactivation_reason !== 'string' || 
            data.deactivation_reason.length < 10 || 
            data.deactivation_reason.length > 500) {
            errors.push('Deactivation reason must be between 10 and 500 characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Export all validation functions
module.exports = {
    validateCreateGSMBOfficer,
    validateUpdateGSMBOfficer,
    validateBulkGSMBOfficers,
    validateOfficerDeactivation,
    isValidPhoneNumber,
    isValidEmail,
    isValidName
};