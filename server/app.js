require('dotenv').config();
const morganBody = require('morgan-body');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSocketEvents = require('./util/socket/socket');
const setupRabbitMQ = require('./rabbitMQ/broker');
const { rateLimiterRoute } = require('./util/ratelimiter');
const Cache = require('./util/cache');
const { startCronJobs } = require('./util/cron');
const { PORT_TEST, PORT, NODE_ENV, API_VERSION } = process.env;
const port = NODE_ENV == 'test' ? PORT_TEST : PORT;
const { logger, loggerStream } = require('./util/logger');

// Express Initialization
const express = require('express');
const app = express();

// CORS allow all
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3001', // put the react app url here
        methods: ['GET', 'POST'],
    }
});

// setupSocketEvents(io);
setupRabbitMQ(io);

app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
morganBody(app, {
    noColors: true, 
    prettify: false,
    stream: loggerStream }
);


// API routes
app.use('/api/' + API_VERSION, rateLimiterRoute, [
    require('./server/routes/admin_route'),
    require('./server/routes/product_route'),
    require('./server/routes/marketing_route'),
    require('./server/routes/user_route'),
    require('./server/routes/order_route'),
    require('./server/routes/seckill_route'),
    require('./server/routes/line_route'),
    require('./server/routes/collection_route'),
    require('./server/routes/message_route'),
]);

// Page not found
app.use(function (req, res, next) {
    res.status(404).sendFile(__dirname + '/public/404.html');
});

// Error handling
app.use(function (err, req, res, next) {
    logger.error(err.message)
    res.status(500).send('Internal Server Error');
});

if (NODE_ENV != 'production') {
    server.listen(port, async () => {
        Cache.connect().catch(() => {
            logger.error('Cache connection failed');
        });
        logger.info(`Listening on port: ${port}`);
        startCronJobs();
    });
}

module.exports = server;
