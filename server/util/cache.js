require('dotenv').config();
const redis = require('ioredis');
const { logger } = require('./logger');
const { CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD } = process.env;

logger.debug(CACHE_HOST, CACHE_PORT, CACHE_USER, CACHE_PASSWORD);

const redisClient = new redis.Redis({
    port: CACHE_PORT,
    host: CACHE_HOST,
    password: CACHE_PASSWORD,
    username: CACHE_USER,
    db: 0,
});

redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
    logger.error('Redis client error', err);
});

module.exports = redisClient;
