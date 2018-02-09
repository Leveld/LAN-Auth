// Axios
const axios = require('axios');
// Express server
const express = require('express');
// Exporess router oAuth
const authRouter = express.Router();
// Express router credentials
const credentialsRouter = express.Router();
// util
const { asyncMiddleware, frontServerIP, authServerIP, clientID, clientSecret, managementToken } = require('../util.js');

const obj = {};

// GET /oauth
authRouter.get('/', (req, res) => {
  res.json();
});
// GET /login
credentialsRouter.get('/', asyncMiddleware(async (req, res, next) => {
  const { code, state } = req.query;

  const auth = await axios.post('https://leveld.auth0.com/oauth/token', {
    grant_type: 'authorization_code',
    client_id: clientID,
    client_secret: clientSecret,
    code,
    redirect_uri: authServerIP + 'login'
  });
  const { access_token, expires_in, id_token, token_type } = auth.data;

  const user = await axios.get('https://leveld.auth0.com/userinfo', {
    headers: {
      Authorization: `Bearer ${access_token}`
    },
    withCredentials: true
  });
  const { sub } = user.data;

  const info = await axios.get(`https://leveld.auth0.com/api/v2/users/${sub}`, {
    headers: {
      Authorization: `Bearer ${managementToken}`
    },
    withCredentials: true
  });
  const { email_verified, email, updated_at, name,  picture, user_id, created_at } = userInfo = info.data;

  await axios.post('/user', {
    email,
    fields: {
      name,
      createdAt: created_at,
      auth0ID: sub
    }
  });

  console.log(JSON.stringify(userInfo, null, 2));
  await res
        .status(307)
        .header('Acess-Token', access_token)
        .redirect(frontServerIP);
}));

module.exports = {
  authRouter,
  credentialsRouter
};
