const winston = require('winston');

const customFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
    level: 'debug',
});

logger.add(new winston.transports.Console({
    format: winston.format.combine(
        winston.format.label({ label: 'api' }),
        winston.format.colorize(),
        winston.format.timestamp(),
        customFormat
    ),
}));

// json format
logger.add(new winston.transports.File({
    filename: process.env.LOG_FILE || 'server.log',
    format: winston.format.combine(
        winston.format.label({ label: 'api' }),
        winston.format.timestamp(),
        winston.format.json()
    ),
}));

const loggerStream = {
    write: (message) => {
        logger.info(message);
    },
};

module.exports = { logger, loggerStream };