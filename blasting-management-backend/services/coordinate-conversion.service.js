// services/coordinate-conversion.service.js
/*const proj4 = require('proj4');

// Define the coordinate systems
// Kadawala coordinate system definition (you'll need to replace these with actual values)
const KADAWALA_DEF = '+proj=tmerc +lat_0=7.000000000 +lon_0=80.716666667 +k=0.9999238418 +x_0=200000.000 +y_0=200000.000 +a=6377276.345 +rf=300.8017';
const WGS84_DEF = '+proj=longlat +datum=WGS84 +no_defs';

class CoordinateConversionService {
    constructor() {
        // Initialize proj4 with the coordinate systems
        proj4.defs('KADAWALA', KADAWALA_DEF);
        proj4.defs('WGS84', WGS84_DEF);
    }

    kadawalaToWGS84(north, east) {
        try {
            const [lon, lat] = proj4('KADAWALA', 'WGS84', [east, north]);
            return {
                latitude: lat,
                longitude: lon
            };
        } catch (error) {
            throw new Error(`Error converting coordinates: ${error.message}`);
        }
    }

    WGS84ToKadawala(latitude, longitude) {
        try {
            const [east, north] = proj4('WGS84', 'KADAWALA', [longitude, latitude]);
            return {
                north: north,
                east: east
            };
        } catch (error) {
            throw new Error(`Error converting coordinates: ${error.message}`);
        }
    }

    validateKadawalaCoordinates(north, east) {
        // Add validation rules for Kadawala coordinate system
        const isValidNorth = north >= 0 && north <= 1000000; // Adjust ranges as needed
        const isValidEast = east >= 0 && east <= 1000000;   // Adjust ranges as needed
        
        if (!isValidNorth || !isValidEast) {
            throw new Error('Invalid Kadawala coordinates');
        }
        return true;
    }

    validateWGS84Coordinates(latitude, longitude) {
        const isValidLat = latitude >= -90 && latitude <= 90;
        const isValidLon = longitude >= -180 && longitude <= 180;
        
        if (!isValidLat || !isValidLon) {
            throw new Error('Invalid WGS84 coordinates');
        }
        return true;
    }
}

module.exports = new CoordinateConversionService();
// services/coordinate-conversion.service.js
/*

class CoordinateConversionService {
    validateKadawalaCoordinates(north, east) {
        // More restrictive and precise validation for Kadawala coordinates
        const isValidNorth = typeof north === 'number' && 
                           north >= 100000 && 
                           north <= 940000 && 
                           Number(north.toFixed(6)) === north;
                           
        const isValidEast = typeof east === 'number' && 
                           east >= 100000 && 
                           east <= 860000 && 
                           Number(east.toFixed(6)) === east;
        
        if (!isValidNorth || !isValidEast) {
            throw new Error('Invalid Kadawala coordinates: Coordinates must be within valid range and have maximum 6 decimal places');
        }
        return true;
    }

    kadawalaToWGS84(north, east) {
        try {
            // Format coordinates to 6 decimal places before conversion
            const formattedNorth = Number(parseFloat(north).toFixed(6));
            const formattedEast = Number(parseFloat(east).toFixed(6));

            // Your existing conversion logic here
            // For now, returning dummy conversion (replace with actual conversion)
            return {
                latitude: formattedNorth / 100000,  // Dummy conversion
                longitude: formattedEast / 100000   // Dummy conversion
            };
        } catch (error) {
            throw new Error(`Coordinate conversion error: ${error.message}`);
        }
    }

    formatCoordinate(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Invalid coordinate value');
        }
        return Number(parseFloat(value).toFixed(6));
    }
}

module.exports = new CoordinateConversionService();*/

// services/coordinate-conversion.service.js

const proj4 = require('proj4');

class CoordinateConversionService {
    constructor() {
        // Kandawala Datum parameters for Sri Lanka
        const KANDAWALA_PARAMS = `+proj=tmerc 
            +lat_0=7.000480027777778 
            +lon_0=80.77171111111111 
            +k=0.9999238418 
            +x_0=200000.0 
            +y_0=200000.0 
            +a=6377276.345 
            +rf=300.8017 
            +units=m 
            +towgs84=-97,787,86,0,0,0,0 
            +no_defs`;

        // WGS84 parameter definition
        const WGS84_PARAMS = "+proj=longlat +datum=WGS84 +no_defs +type=crs";

        // Initialize coordinate systems
        proj4.defs('KANDAWALA', KANDAWALA_PARAMS.replace(/\s+/g, ' '));
        proj4.defs('WGS84', WGS84_PARAMS);
    }

    kadawalaToWGS84(north, east) {
        try {
            // Format coordinates
            const formattedNorth = Number(parseFloat(north).toFixed(6));
            const formattedEast = Number(parseFloat(east).toFixed(6));

            // Convert coordinates
            const [lon, lat] = proj4('KANDAWALA', 'WGS84', [formattedEast, formattedNorth]);

            // Return formatted WGS84 coordinates
            return {
                latitude: Number(lat.toFixed(6)),
                longitude: Number(lon.toFixed(6))
            };
        } catch (error) {
            throw new Error(`Coordinate conversion error: ${error.message}`);
        }
    }

    WGS84ToKadawala(latitude, longitude) {
        try {
            // Format coordinates
            const formattedLat = Number(parseFloat(latitude).toFixed(6));
            const formattedLon = Number(parseFloat(longitude).toFixed(6));

            // Convert coordinates
            const [east, north] = proj4('WGS84', 'KANDAWALA', [formattedLon, formattedLat]);

            // Return formatted Kadawala coordinates
            return {
                north: Number(north.toFixed(6)),
                east: Number(east.toFixed(6))
            };
        } catch (error) {
            throw new Error(`Coordinate conversion error: ${error.message}`);
        }
    }

    validateKadawalaCoordinates(north, east) {
        // Validate range for Kadawala grid coordinates in Sri Lanka
        const isValidNorth = typeof north === 'number' && 
                           north >= 0 && 
                           north <= 1000000 && 
                           Number(north.toFixed(6)) === north;
                           
        const isValidEast = typeof east === 'number' && 
                           east >= 0 && 
                           east <= 1000000 && 
                           Number(east.toFixed(6)) === east;
        
        if (!isValidNorth || !isValidEast) {
            throw new Error('Invalid Kadawala coordinates: Values must be within valid range and have maximum 6 decimal places');
        }
        return true;
    }

    validateWGS84Coordinates(latitude, longitude) {
        // Validate range for WGS84 coordinates in Sri Lanka
        const isValidLat = typeof latitude === 'number' && 
                          latitude >= 5.916667 && 
                          latitude <= 9.850000;
        
        const isValidLon = typeof longitude === 'number' && 
                          longitude >= 79.683333 && 
                          longitude <= 81.883333;
        
        if (!isValidLat || !isValidLon) {
            throw new Error('Invalid WGS84 coordinates: Values must be within Sri Lanka bounds');
        }
        return true;
    }
}

module.exports = new CoordinateConversionService();