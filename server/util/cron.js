const cron = require('node-cron');
const OrderController = require('../server/controllers/order_controller');

async function startCronJobs() {
  console.log('start cron jobs');
  cron.schedule('* * * * *', async () => {
    await OrderController.processPendingOrders();
  });
}


module.exports = {
  startCronJobs,
};
