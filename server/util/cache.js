require('dotenv').config();
const redis = require('ioredis');
const { logger } = require('./logger');
const { CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;

logger.debug(CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD);

const redisClient = redis.createClient({
    url: `redis://${CACHE_USER}:${CACHE_PASSWORD}@${CACHE_HOST}:${CACHE_PORT}`,
    socket: {
        keepAlive: false,
    },
});

redisClient.ready = false;

redisClient.on('ready', () => {
    redisClient.ready = true;
    logger.info('Redis is ready');
});

redisClient.on('error', (err) => {
    redisClient.ready = false;
    logger.error('Error connecting to Redis:', err);
});

redisClient.on('end', () => {
    redisClient.ready = false;
    logger.info('Redis connection has closed');
});

module.exports = redisClient;
