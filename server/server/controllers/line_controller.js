const axios = require('axios');
const path = require('path');
const querystring = require('querystring');
const { sendLineNotification, revokeToken } = require('../../util/lineNotification');
const User = require('../models/user_model');
const UserSeckill = require('../models/user_seckill_model');
const { REACT_APP_URL } = process.env;


const startLineOauth = async (req, res) => {
  const clientId = process.env.LINE_SERVICE_CLIENT_ID;
  const redirectUri = encodeURIComponent(`${process.env.BACKEND_HOST}/api/1.0/line/oauth/callback`);
  const responseType = 'code';
  const scope = 'notify';
  const responseMode = 'form_post';

  const email = req.query.email;
  const originalUrl = req.query.originalUrl;
  const stateObj = { email: email, originalUrl: originalUrl };
  const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');

  const authUrl = `https://notify-bot.line.me/oauth/authorize?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_mode=${responseMode}`;

  // Redirect the user to the authorization URL
  return res.redirect(authUrl);
}

const lineOAuthFailedCallback = (req, res) => {
  const { error, error_description, state } = req.query;
  try {
    if (error) {
      console.error('Error lineOAuthCallback:', error);
      console.log('Error: ' + error_description);
      const decodedState = Buffer.from(state, 'base64').toString('utf-8');
      const stateObj = JSON.parse(decodedState);
      const originalUrl = stateObj.originalUrl; // The URL to redirect the user back to
      console.log('decodedState', decodedState, originalUrl);
      return res.redirect(originalUrl);
    }
  } catch (error) {
    console.error('Failed lineOAuthCallback:', error);
  }
}

const lineOAuthSuccessCallback = async (req, res) => {
  const { code, state } = req.body; // Get the code from query parameters
  // Decode the state parameter from base64 and parse it as JSON
  const decodedState = Buffer.from(state, 'base64').toString('utf-8');
  const stateObj = JSON.parse(decodedState);

  const email = stateObj.email; // You can use this email as needed
  const originalUrl = stateObj.originalUrl; // The URL to redirect the user back to


  const data = querystring.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: `${REACT_APP_URL}/api/1.0/line/oauth/callback`,
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
    console.log('token', token);
    if (!token) {
      return res.status(400).send('Cannot get token');
    }

    // save the token to database
    await User.saveLineNotifyToken(email, token);


    const message = 'Welcome to STYLiSH!!';
    const filePath = path.join(__dirname, 'logo.png'); // Replace with your actual file path
    sendLineNotification(token, filePath, message);

    // redirect to frontend
    res.redirect(originalUrl);

  } catch (error) {
    throw new Error('Error lineOAuthCallback: ' + error);
  }
}


const sendLineNotify = async (req, res) => {
  try {
    const { email, message } = req.body;
    const user = await User.getUserDetail(email, null);
    const token = user.line_notify_token;

    // const filePath = path.join(__dirname, 'logo.png'); // Replace with your actual file path
    if (!token) {
      return res.status(400).send('No token found');
    } else {
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

const addNotifyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    const result = await UserSeckill.addNotifyProduct(email, id);
    console.log("db", result);
    if (result === -1) {
      return res.status(400).send({ error: 'Already exist' });
    }

    res.status(200).send({ message: 'ok' });

  } catch (error) {
    console.error('Error addNotifyProduct:', error);
    res.status(500).send('Internal Server Error');
  }
}

const getNotifyProductandUser = async () => {
  try {
    const result = await UserSeckill.getNotifyProductandUser();
    console.log("rows", result);
    // send notification
    for (let i = 0; i < result.length; i++) {
      const { id: productId, line_notify_token, userId } = result[i];
      const message = `您訂閱的商品即將開賣，請留意`;
      sendLineNotification(line_notify_token, null, message);
      // update database
      await UserSeckill.removeNotifyProduct(userId, productId);
    }
  } catch (error) {
    console.error('Error getNotifyProductandUser:', error);
    res.status(500).send('Internal Server Error');
  }
}


module.exports = {
  startLineOauth,
  lineOAuthSuccessCallback,
  lineOAuthFailedCallback,
  sendLineNotify,
  revokeLineNotify,
  addNotifyProduct,
  getNotifyProductandUser
}