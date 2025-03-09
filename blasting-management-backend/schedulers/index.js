const licenseScheduler = require('./license-scheduler');
const inventoryScheduler = require('./inventory-scheduler');

const initializeSchedulers = () => {
    // Initialize all schedulers
    licenseScheduler.init();
    inventoryScheduler.init();
    
    console.log('All schedulers initialized successfully');
};

module.exports = {
    initializeSchedulers
};