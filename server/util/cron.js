const cron = require('node-cron');
const OrderController = require('../server/controllers/order_controller');
const { logger } = require('./logger');

async function startCronJobs() {
  logger.info('start cron jobs');
  cron.schedule('* * * * *', async () => {
    await OrderController.processPendingOrders();
  });
}


module.exports = {
  startCronJobs,
};
