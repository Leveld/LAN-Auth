const axios = require('axios');
const base64 = require('base64-url');
const { google } = require('googleapis');
const plus = google.plus('v1');
const OAuth2Client = google.auth.OAuth2;
const { asyncMiddleware, frontServerIP, authServerIP, dbServerIP, } = require('capstone-utils');

const { clientID, clientSecret, managementToken } = require('../secret.json');
const { COToken } = require('../models');

const oauth2Client = new OAuth2Client(
  '660421589652-k537cl8vg3v8imub4culbjon6f20fph6.apps.googleusercontent.com',
  'yYuc3V2fIT4DOfnZXIyhBvsh',
  `http://localhost:3002/goauth`
);

google.options({ auth: oauth2Client });

// GET /coURL
const generateURL = async (req, res, next) => {
  const { type = '', redirect = '', userID = '', userType = '' } = req.query;

  // TODO check type and redirect and user and userType are strings.
  const state = base64.encode(JSON.stringify({
    redirect,
    userID,
    userType
  }));
  switch(type.toLowerCase()) {
    case 'google':
      const scopes = [
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/plus.me'
      ];

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
        state
      });

      return await res.send({ url });
    default:
      return await res.send('not found'); // TODO make it an error
  }
}

// GET /goauth
const googleCallback = async (req, res, next) => {
  const { state, code } = req.query;

  const { redirect = '', userID, userType } = JSON.parse(base64.decode(state));

  // TODO check that we have userID and userType

  let tokens = await oauth2Client.getToken(code);
  if (!tokens)
    throwError('GOAuthError', `Couldn't get tokens.`);
  tokens = tokens.tokens;
  const token = tokens.access_token;
  const refreshToken = tokens.refresh_token;
  const expires = new Date(tokens.expiry_date).toISOString();

  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({
    version: 'v3'
  });

  const callback = async (error, response) => {
    try {
      if (error)
        throw error;

      const channelID = response.data.items[0].id;
      const channelLink = `https://www.youtube.com/channel/${channelID}`;
      const profilePicture = response.data.items[0].snippet.thumbnails.default.url;
      const channelName = response.data.items[0].snippet.localized.title;

      let contentOutlet = await axios.post(`${dbServerIP}outlet`, {
        fields: {
          channelID,
          channelLink,
          profilePicture,
          channelName,
          owner: {
            ownerType: userType,
            ownerID: userID
          }
        }
      });

      if (contentOutlet)
        contentOutlet = contentOutlet.data;

      const coToken = new COToken({
        token: {
          token,
          refreshToken,
          expires
         },
        contentOutlet: contentOutlet._id
      });

      await coToken.save();

      await res.status(307).redirect(`${frontServerIP}${redirect}`);
    } catch (error) {
      next(error);
    }
  };

  youtube.channels.list({
    "part": "snippet",
    "mine": "true"
  }, callback);
}

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
  generateURL,
  googleCallback,
  loginCallback
};
