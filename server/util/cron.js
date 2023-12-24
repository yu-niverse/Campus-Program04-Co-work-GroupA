const cron = require('node-cron');
const { pool } = require('../server/models/mysqlcon');
const { sendLineNotification, generateDeliverMessage } = require('./lineNotification');

async function startCronJobs() {
  console.log('start cron jobs');
  cron.schedule('* * * * *', async () => {
    try {
      const query = `
        SELECT o.*, u.line_notify_token 
        FROM order_table o
        JOIN user u ON o.user_id = u.id
        WHERE o.delivery_date < NOW() AND o.is_notification_sent = false
      `;
      const [orders] = await pool.execute(query);
      if (orders.length === 0) {
        return;
      }

      // Create an array of notification promises
      const notificationPromises = orders.map(order => {
        if (!order.line_notify_token) {
          console.error('No line_notify_token found for order ID:', order.id);
          return;
        }

        if (typeof order.details === 'string') {
          order.details = JSON.parse(order.details);
        }
        return sendNotificationAndUpdate(order)
      });

      // // Execute all promises in parallel
      await Promise.all(notificationPromises);
    } catch (e) {
      console.error('Error querying orders or sending notifications:', e);
    }
  });
}

async function sendNotificationAndUpdate(order) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const message = await generateDeliverMessage(order);
    console.log('order_id:', order.id, ' sent');
    await sendLineNotification(order.line_notify_token, null, message);
    await connection.execute('UPDATE order_table SET is_notification_sent = true WHERE id = ?', [order.id]);
    await connection.commit();
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error processing order ID:', order.id, error);
    throw error; // rethrow to be caught by Promise.all
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

module.exports = {
  startCronJobs,
  sendLineNotification
};
