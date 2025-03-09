// utils/passwordValidator.js

const validatePasswordStrength = (password) => {
    const errors = [];

    // Minimum length check
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    // Uppercase letter check
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Lowercase letter check
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Number check
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return errors;
};

// Optional: Add additional password-related validation functions
const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
        return ['Passwords do not match'];
    }
    return [];
};

module.exports = {
    validatePasswordStrength,
    validatePasswordMatch
};