const axios = require('axios');
const path = require('path');
const querystring = require('querystring');
const { sendLineNotification, revokeToken } = require('../../util/lineNotification');
const User = require('../models/user_model');


const lineOAuthCallback = async (req, res) => {
  const { code, state: email } = req.body; // Get the code from query parameters

  const data = querystring.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:3000/api/1.0/line/oauth/callback',
    client_id: process.env.LINE_SERVICE_CLIENT_ID,
    client_secret: process.env.LINE_SERVICE_CLIENT_SECRET
  });

  try {
    const response = await axios.post('https://notify-bot.line.me/oauth/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const token = response.data.access_token;
    console.log(token);


    // save the token to database
    const result = await User.saveLineNotifyToken(email, token);

    if (!result) {
      return res.status(500).send('Internal Server Error');
    }

    const message = 'Welcome to STYLiSH!!';
    const filePath = path.join(__dirname, 'logo.png'); // Replace with your actual file path
    sendLineNotification(token, filePath, message);

    // redirect to frontend
    res.redirect('http://localhost:3001/profile');

  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Internal Server Error');
  }
}


const lineNotify = async (req, res) => {
  try {
    const { email, message } = req.body;
    console.log('hi', email, message);
    const user = await User.getUserDetail(email, null);
    console.log(user);
    const token = user.line_notify_token;
    console.log(token);

    // const filePath = path.join(__dirname, 'logo.png'); // Replace with your actual file path
    if (!token) {
      return res.status(400).send('No token found');
    } else {
      console.log("token", token);
      sendLineNotification(token, null, message);
    }

    res.send('ok');
  } catch (error) {
    console.error('Error lineNotify:', error);
    res.status(500).send('Internal Server Error');
  }
}


const revokeLineNotify = async (req, res) => {
  try {
    const { email } = req.body;
    // get line_notify_token from database using email
    const user = await User.getUserDetail(email, null);
    const token = user.line_notify_token;
    const revokeStatus = await revokeToken(token);

    if (revokeStatus !== 200) {
      console.error('Error revoking token');
    } else {
      const result = await User.revokeLineNotifyToken(email);
      console.log("db", result);
    }

    res.send('ok');
  } catch (error) {
    console.error('Error revokeLineNotify:', error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = {
  lineOAuthCallback,
  lineNotify,
  revokeLineNotify,
}