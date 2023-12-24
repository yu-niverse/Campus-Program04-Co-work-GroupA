const cron = require('node-cron');
const FormData = require('form-data');
const axios = require('axios');
const { pool } = require('../server/models/mysqlcon');

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

    const message = await generateMessage(order);
    console.log('order_id:', order.id, ' sent');
    await sendLineNotification(order.line_notify_token, message);
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


const generateMessage = async (order) => {
  const message =
    `${order.details.recipient.name} 您好，您的訂單已送達，請留意收件。` + '\n\n' +
    `收件地址：${order.details.recipient.address}` + '\n' +
    `總價： ${order.details.total}` + '\n'
  return message;
}

async function sendLineNotification(token, message) {
  try {
    const formData = new FormData();
    formData.append('message', message);

    const config = {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post('https://notify-api.line.me/api/notify', formData, config);
    console.log('Notification sent successfully:', response.data);
  } catch (error) {
    // Handle any errors
    console.error('Error sending notification:', error);
  }
}

module.exports = {
  startCronJobs,
  sendLineNotification
};
