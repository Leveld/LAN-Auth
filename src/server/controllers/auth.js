const axios = require('axios');
const { asyncMiddleware, frontServerIP, authServerIP, dbServerIP, } = require('capstone-utils');

const { clientID, clientSecret, managementToken } = require('../secret.json');

// GET /oauth
const getOAuth = async (req, res, next) => {
   res.json();
};

// GET /login
const loginCallback = async (req, res, next) => {
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
  let newUser = false;

  try {
    await axios.get(`${dbServerIP}user?email=${email}`);
    //user exists
  } catch (error) {
    // user doesn't exist
    // TODO add support for other errors that could occur
    // instead of just assuming that the error is from
    // a user not existing
    await axios.post(`${dbServerIP}user`, {
      email,
      fields: {
        name,
        createdAt: created_at,
        auth0ID: sub
      }
    });
    newUser = true;
  }

  await axios.post(`${authServerIP}token`, {
    token: access_token,
    email,
    emailVerified: email_verified,
    expires: new Date((new Date() / 1) + (1000 * expires_in)).toISOString()
  });

  console.log(access_token);

  const domain = /^(https?:\/\/)?([^:^\/]*)(:[0-9]*)(\/[^#^?]*)(.*)/g.exec(frontServerIP);

  if (email_verified)
    await res
          .status(307)
          .cookie('access_token', access_token, {
            secure: false,
            domain: domain[2],
            maxAge: 604800
          })
          .redirect(frontServerIP + (newUser ? 'register' : ''));
  else
    await res.redirect(`${frontServerIP}error?type=verify`);
};

module.exports = {
  getOAuth,
  loginCallback
};
