const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');


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
    console.log('Notification sent successfully:', response.data);
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


module.exports = {
  revokeToken,
  sendLineNotification
}