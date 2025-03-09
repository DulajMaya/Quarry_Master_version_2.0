/*const app = require('./app');
const { sequelize } = require('./models');
const cors = require('cors');

const PORT = process.env.PORT ;

app.use(cors({
  origin: 'http://localhost:4200',  // Allow requests from your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],  // Specify allowed headers
  credentials: true  // Allow cookies and credentials
}));

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('Database connection failed:', err));
*/

/*const app = require('./app');
const { sequelize } = require('./models');
const cors = require('cors');
const { createServer } = require('http');
const { initializeSocket } = require('./websocket/config/socket.config');

const PORT = process.env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Initialize WebSocket after database connection
sequelize.sync().then(async () => {
    try {
        // Initialize Socket.IO
        const io = await initializeSocket(httpServer);

        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`WebSocket server initialized`);
        });
    } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }
}).catch(err => console.error('Database connection failed:', err));

// Handle server shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});*/
const app = require('./app');
const { sequelize } = require('./models');
const cors = require('cors');
const { createServer } = require('http');
const { initializeSocket } = require('./websocket/config/socket.config');

const PORT = process.env.PORT;

// Create HTTP server
const httpServer = createServer(app);

// Store io instance
let io;

// CORS configuration
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Function to get io instance
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Initialize WebSocket after database connection
sequelize.sync().then(async () => {
    try {
        // Initialize Socket.IO and store the instance
        io = await initializeSocket(httpServer);
        
        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`WebSocket server initialized`);
        });
    } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
    }
}).catch(err => console.error('Database connection failed:', err));

// Handle server shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, getIO };