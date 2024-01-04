const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const { logger } = require('./logger');


async function sendLineNotification(token, filePath, message) {
  try {
    const formData = new FormData();
    formData.append('message', message);

    if (filePath) {
      const fileStream = fs.createReadStream(filePath);
      formData.append('imageFile', fileStream);
    }

    const config = {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    };

    const response = await axios.post('https://notify-api.line.me/api/notify', formData, config);
    logger.info('Notification sent successfully:', response.data);
  } catch (error) {
    // Handle any errors
    console.error('Error sending notification:', error);
  }
}

const revokeToken = async (token) => {
  const response = await axios.post('https://notify-api.line.me/api/revoke', {}, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${token}`
    }
  });

  return response.data.status;
}


const generateDeliverMessage = async (order) => {
  const message =
    `${order.details.recipient.name} 您好，您的訂單已送達，請留意收件。` + '\n\n' +
    `收件地址：${order.details.recipient.address}` + '\n' +
    `總價： ${order.details.total}` + '\n'
  return message;
}


module.exports = {
  revokeToken,
  sendLineNotification,
  generateDeliverMessage
}