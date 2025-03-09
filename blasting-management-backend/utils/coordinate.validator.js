// utils/coordinate.validator.js

class CoordinateValidator {
    // Kadawala coordinate system boundaries for Sri Lanka
    static KADAWALA_BOUNDS = {
        NORTH: {
            MIN: 160000,
            MAX: 940000
        },
        EAST: {
            MIN: 130000,
            MAX: 860000
        }
    };

    // WGS84 boundaries for Sri Lanka
    static WGS84_BOUNDS = {
        LATITUDE: {
            MIN: 5.916667,    // Southernmost point
            MAX: 9.850000     // Northernmost point
        },
        LONGITUDE: {
            MIN: 79.683333,   // Westernmost point
            MAX: 81.883333    // Easternmost point
        }
    };

    // Validate Kadawala coordinates
    static isValidKadawalaCoordinate(north, east) {
        const errors = [];

        // Check if coordinates are numbers
        if (typeof north !== 'number' || isNaN(north)) {
            errors.push('Kadawala North coordinate must be a valid number');
        }
        if (typeof east !== 'number' || isNaN(east)) {
            errors.push('Kadawala East coordinate must be a valid number');
        }

        // If both are numbers, check bounds
        if (errors.length === 0) {
            if (north < this.KADAWALA_BOUNDS.NORTH.MIN || north > this.KADAWALA_BOUNDS.NORTH.MAX) {
                errors.push(`Kadawala North coordinate must be between ${this.KADAWALA_BOUNDS.NORTH.MIN} and ${this.KADAWALA_BOUNDS.NORTH.MAX}`);
            }
            if (east < this.KADAWALA_BOUNDS.EAST.MIN || east > this.KADAWALA_BOUNDS.EAST.MAX) {
                errors.push(`Kadawala East coordinate must be between ${this.KADAWALA_BOUNDS.EAST.MIN} and ${this.KADAWALA_BOUNDS.EAST.MAX}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validate WGS84 coordinates
    static isValidWGS84Coordinate(latitude, longitude) {
        const errors = [];

        // Check if coordinates are numbers
        if (typeof latitude !== 'number' || isNaN(latitude)) {
            errors.push('Latitude must be a valid number');
        }
        if (typeof longitude !== 'number' || isNaN(longitude)) {
            errors.push('Longitude must be a valid number');
        }

        // If both are numbers, check bounds
        if (errors.length === 0) {
            if (latitude < this.WGS84_BOUNDS.LATITUDE.MIN || latitude > this.WGS84_BOUNDS.LATITUDE.MAX) {
                errors.push(`Latitude must be between ${this.WGS84_BOUNDS.LATITUDE.MIN} and ${this.WGS84_BOUNDS.LATITUDE.MAX}`);
            }
            if (longitude < this.WGS84_BOUNDS.LONGITUDE.MIN || longitude > this.WGS84_BOUNDS.LONGITUDE.MAX) {
                errors.push(`Longitude must be between ${this.WGS84_BOUNDS.LONGITUDE.MIN} and ${this.WGS84_BOUNDS.LONGITUDE.MAX}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Validate coordinate precision
    static validatePrecision(coordinate, requiredDecimals = 6) {
        if (typeof coordinate !== 'number' || isNaN(coordinate)) {
            return false;
        }

        const decimalStr = coordinate.toString().split('.')[1] || '';
        return decimalStr.length <= requiredDecimals;
    }

    // Validate a complete set of coordinates (both systems)
    static validateCompleteCoordinates(data) {
        const errors = [];

        // Validate Kadawala coordinates
        if (data.kadawala_gps_north !== undefined && data.kadawala_gps_east !== undefined) {
            const kadawalaValidation = this.isValidKadawalaCoordinate(
                data.kadawala_gps_north,
                data.kadawala_gps_east
            );
            if (!kadawalaValidation.isValid) {
                errors.push(...kadawalaValidation.errors);
            }
        }

        // Validate WGS84 coordinates if present
        if (data.wgs_north !== undefined && data.wgs_east !== undefined) {
            const wgs84Validation = this.isValidWGS84Coordinate(
                data.wgs_north,
                data.wgs_east
            );
            if (!wgs84Validation.isValid) {
                errors.push(...wgs84Validation.errors);
            }
        }

        // Validate precision
        const coordinates = [
            { value: data.kadawala_gps_north, name: 'Kadawala North' },
            { value: data.kadawala_gps_east, name: 'Kadawala East' },
            { value: data.wgs_north, name: 'WGS84 North' },
            { value: data.wgs_east, name: 'WGS84 East' }
        ];

        coordinates.forEach(coord => {
            if (coord.value !== undefined && !this.validatePrecision(coord.value)) {
                errors.push(`${coord.name} coordinate has too many decimal places (max 6)`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Helper method to format coordinates
    static formatCoordinate(value, decimals = 6) {
        if (typeof value !== 'number' || isNaN(value)) {
            return null;
        }
        return Number(value.toFixed(decimals));
    }

    // Validate and format a complete set of coordinates
    static validateAndFormatCoordinates(data) {
        const validation = this.validateCompleteCoordinates(data);
        if (!validation.isValid) {
            return validation;
        }

        // Format coordinates to standard precision
        const formatted = {
            kadawala_gps_north: this.formatCoordinate(data.kadawala_gps_north),
            kadawala_gps_east: this.formatCoordinate(data.kadawala_gps_east),
            wgs_north: this.formatCoordinate(data.wgs_north),
            wgs_east: this.formatCoordinate(data.wgs_east)
        };

        return {
            isValid: true,
            formattedData: formatted
        };
    }
}

module.exports = CoordinateValidator;