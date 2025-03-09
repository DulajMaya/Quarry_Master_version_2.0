/*const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const path = require('path');


const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const licenseRoutes = require('./routes/mining-license.routes');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
const licensesDir = path.join(uploadDir, 'licenses');


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(licensesDir)) {
  fs.mkdirSync(licensesDir);
}

app.use(cors({
    origin: 'http://localhost:4200',  // Allow requests from your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
    credentials: true  // Allow cookies and credentials
  }));

app.use(express.json());



// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes); 
app.use('/roles', roleRoutes);
app.use('/api/licenses', licenseRoutes);


module.exports = app; */

const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initializeSchedulers } = require('./schedulers');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const roleRoutes = require('./routes/role.routes');
const licenseRoutes = require('./routes/mining-license.routes');
// New route imports
const testBlastRoutes = require('./routes/test-blast.routes');
const miningSiteRoutes = require('./routes/mining-site.routes');
const gsmbOfficerRoutes = require('./routes/gsmb-officer.routes');
const monitoringLocationRoutes = require('./routes/monitoring-location.routes');
const issuanceRoutes = require('./routes/issuance.routes');
const siteEngineerRoutes = require('./routes/site-engineer.routes');
const explosiveControllerRoutes = require('./routes/explosive-controller.routes');
const explosiveDealerRoutes = require('./routes/explosive-dealer.routes');
const explosiveTypeRoutes = require('./routes/explosive-type.routes');
const explosiveStoreRoutes = require('./routes/explosive-store.routes');
const storeInventoryRoutes = require('./routes/store-inventory.routes');
const storeThresholdRoutes = require('./routes/store-threshold.routes');
const explosivePermitRoutes = require('./routes/explosive-permit.routes');
const weeklyQuotaRoutes = require('./routes/weekly-quota.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const notificationRoutes = require('./notifications/routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const minableBoundaryRoutes = require('./routes/minable-boundary.routes');

// Import new blast management routes
const drillingSiteRoutes = require('./routes/drilling-site.routes');
const drillingPatternRoutes = require('./routes/drilling-pattern.routes');
const drillHoleRoutes = require('./routes/drill-hole.routes');
const dailyBlastOperationRoutes = require('./routes/daily-blast-operation.routes');
const dailyBlastExplosiveRoutes = require('./routes/daily-blast-explosive.routes');
const blastEventRoutes = require('./routes/blast-event.routes');
const blastHoleRoutes = require('./routes/blast-hole.routes');
const blastResultRoutes = require('./routes/blast-result.routes');



/* after drilling and blastin routes 

// Directory setup
const uploadDir = path.join(__dirname, 'uploads');
const licensesDir = path.join(uploadDir, 'licenses');
const blastSketchesDir = path.join(uploadDir, 'blast-sketches');
const monitoringReportsDir = path.join(uploadDir, 'monitoring-reports');

// Create necessary directories
const directories = [uploadDir, licensesDir, blastSketchesDir, monitoringReportsDir];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});*/

// Directory setup for new upload types
const uploadDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/licenses'),
    path.join(__dirname, 'uploads/delay-pattern'),
    path.join(__dirname, 'uploads/blast-results'),
    path.join(__dirname, 'uploads/monitoring-reports'),
    path.join(__dirname, 'uploads/payment-proofs'),
    path.join(__dirname, 'uploads/permits'),
    path.join(__dirname, 'uploads/quotas'),
    path.join(__dirname, 'uploads/pattern-diagrams')
];

// Create directories if they don't exist
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// CORS configuration
app.use(cors({
    origin: 'http://localhost:4200',  // Allow requests from your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Added PATCH for status updates
    allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
    credentials: true  // Allow cookies and credentials
}));

// Middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
initializeSchedulers();

// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/roles', roleRoutes);
app.use('/api/licenses', licenseRoutes);

// New API routes
app.use('/api/test-blasts', testBlastRoutes);
app.use('/api/mining-sites', miningSiteRoutes);
app.use('/api/gsmb-officers', gsmbOfficerRoutes);
app.use('/api/monitoring-locations', monitoringLocationRoutes);

// new api for explosive integration
app.use('/api/site-engineers', siteEngineerRoutes);
app.use('/api/explosive-controllers', explosiveControllerRoutes);
app.use('/api/explosive-dealers', explosiveDealerRoutes);
app.use('/api/explosive-types', explosiveTypeRoutes);
app.use('/api/explosive-stores', explosiveStoreRoutes);
app.use('/api/store-inventory', storeInventoryRoutes);
app.use('/api/store-thresholds', storeThresholdRoutes);
app.use('/api/explosive-permits', explosivePermitRoutes);
app.use('/api/weekly-quotas', weeklyQuotaRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/issuance', issuanceRoutes);

// new notification routes
app.use('/api/notifications', notificationRoutes);


app.use('/api/admin', adminRoutes);
app.use('/api/boundaries', minableBoundaryRoutes);

// Register new blast management routes
app.use('/api/drilling-sites', drillingSiteRoutes);
app.use('/api/drilling-patterns', drillingPatternRoutes);
app.use('/api/drill-holes', drillHoleRoutes);
app.use('/api/daily-blast-operations', dailyBlastOperationRoutes);
app.use('/api/blast-events', blastEventRoutes);
app.use('/api/blast-holes', blastHoleRoutes);
app.use('/api/blast-results', blastResultRoutes);




// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

module.exports = app;
