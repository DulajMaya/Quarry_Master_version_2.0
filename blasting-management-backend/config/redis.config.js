const Redis = require('redis');

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    retryStrategy: function (times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
};

const redisClient = Redis.createClient(redisConfig);

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Initialize Redis connection
(async () => {
    await redisClient.connect();
})();

module.exports = {
    redisClient,
    redisConfig
};