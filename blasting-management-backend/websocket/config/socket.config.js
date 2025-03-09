const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisClient } = require('../../config/redis.config');

const socketConfig = {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    cookie: {
        name: 'io',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
};

const initializeSocket = async (httpServer) => {
    try {
        const io = new Server(httpServer, socketConfig);

        // Create a duplicate subscriber client for Redis adapter
        const subClient = redisClient.duplicate();
        await subClient.connect();

        // Set up Redis adapter
        io.adapter(createAdapter(redisClient, subClient));

        // Connection handling
        io.on('connection', (socket) => {
            console.log('New client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });
        });

        return io;
    } catch (error) {
        console.error('Socket initialization error:', error);
        throw error;
    }
};

module.exports = {
    socketConfig,
    initializeSocket
};