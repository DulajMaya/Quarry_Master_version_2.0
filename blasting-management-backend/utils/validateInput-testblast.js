// utils/validateInput-testblast.js

// Function to validate if date is in YYYY-MM-DD format and not in the past
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date instanceof Date && !isNaN(date) && date >= today;
};

// Function to validate coordinates
const isValidCoordinate = (coord) => {
    return typeof coord === 'number' && !isNaN(coord);
};

// Function to validate time in HH:mm:ss format
const isValidTime = (timeString) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return timeRegex.test(timeString);
};

const validateTestBlastDetails = (data) => {
    const errors = [];

    // Required field checks
    if (!data.site_id || typeof data.site_id !== 'number') {
        errors.push('Valid site_id is required');
    }

    if (!data.license_id || typeof data.license_id !== 'number') {
        errors.push('Valid license_id is required');
    }

    if (!data.blast_date || !isValidDate(data.blast_date)) {
        errors.push('Valid blast_date is required (YYYY-MM-DD format) and should not be in the past');
    }

    if (!data.number_of_blasts || data.number_of_blasts < 1) {
        errors.push('number_of_blasts must be greater than 0');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateTestBlast = (data) => {
    const errors = [];

    // Required field checks
    if (!data.test_blast_details_id || isNaN(data.test_blast_details_id)) {
        errors.push('Valid test_blast_details_id is required');
    }

    if (!data.gsmb_officer_id || isNaN(data.gsmb_officer_id)) {
        errors.push('Valid gsmb_officer_id is required');
    }

    if (!data.kadawala_gps_north || !isValidCoordinate(parseFloat(data.kadawala_gps_north))) {
        errors.push('Valid kadawala_gps_north coordinate is required');
    }

    if (!data.kadawala_gps_east || !isValidCoordinate(parseFloat(data.kadawala_gps_east))) {
        errors.push('Valid kadawala_gps_east coordinate is required');
    }

    if (!data.time_fired || !isValidTime(data.time_fired)) {
        errors.push('Valid time_fired is required (HH:mm:ss format)');
    }

    if (!data.number_of_holes || parseInt(data.number_of_holes, 10) < 1) {
        errors.push('number_of_holes must be greater than 0');
    }

    if (!data.number_of_rows || parseInt(data.number_of_rows, 10) < 1) {
        errors.push('number_of_rows must be greater than 0');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateTestBlastHole = (data) => {
    const errors = [];

    // Required field checks
    if (!data.test_blast_id || typeof data.test_blast_id !== 'number') {
        errors.push('Valid test_blast_id is required');
    }

    if (!data.water_gel_use || data.water_gel_use < 0) {
        errors.push('water_gel_use must be a positive number');
    }

    if (!data.anfo_use || data.anfo_use < 0) {
        errors.push('anfo_use must be a positive number');
    }

    if (data.ed_delay_number === null || data.ed_delay_number === undefined || data.ed_delay_number < 0) {
        errors.push('Valid ed_delay_number is required');
    }

    if (!data.diameter || data.diameter <= 0) {
        errors.push('diameter must be greater than 0');
    }

    if (!data.depth || data.depth <= 0) {
        errors.push('depth must be greater than 0');
    }

    if (!data.bench_height || data.bench_height <= 0) {
        errors.push('bench_height must be greater than 0');
    }

    if (!data.stemming_height || data.stemming_height <= 0) {
        errors.push('stemming_height must be greater than 0');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateBlastApproval = (data) => {
    const errors = [];

    if (typeof data.is_approved !== 'boolean') {
        errors.push('is_approved must be a boolean value');
    }

    // Optional comments validation
    if (data.comments && typeof data.comments !== 'string') {
        errors.push('comments must be a string');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

module.exports = {
    validateTestBlastDetails,
    validateTestBlast,
    validateTestBlastHole,
    validateBlastApproval,
    isValidDate,
    isValidTime,
    isValidCoordinate
};