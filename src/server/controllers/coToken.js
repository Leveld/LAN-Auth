const axios = require('axios');
const { USER_ERROR, authServerIP, throwError, googleRedirect } = require('capstone-utils');
const { google } = require('googleapis');
const { COToken } = require('../models');
const { googleClientID, googleClientSecret } = require('../secret.json');

const OAuth2Client = google.auth.OAuth2;
const oauth2Client = new OAuth2Client(
  googleClientID,
  googleClientSecret,
  googleRedirect
);

// GET /cotoken
const getToken = async (req, res, next) => {
  let { contentOutlet } = req.query;

  if (contentOutlet.startsWith('"')) {
    contentOutlet = contentOutlet.substring(1);
  }
  if (contentOutlet.endsWith('"')) {
    contentOutlet = contentOutlet.substring(0, contentOutlet.length - 1);
  }

  const doc = await COToken.findOne({ contentOutlet });

  if (!doc)
    throwError('AuthCoToken', `No Token found for specified ContentOutlet '${contentOutlet}'`);

  const { token : access_token, refreshToken : refresh_token, expires : expiry_date } = doc.token;

  if((expiry_date - new Date()) <= (60 * 1000)) {
    oauth2Client.setCredentials({
      access_token,
      refresh_token,
      expiry_date: expiry_date / 1
    });
    let newTokens = await oauth2Client.refreshAccessToken();
    if(newTokens)
      newTokens = newTokens.credentials;
    else
      throwError('AuthCoTokenError', 'Could not refresh tokens');
    doc.token.token = newTokens.access_token;
    doc.token.expires = new Date(newTokens.expiry_date).toISOString();
    await doc.save();
  }
  await res.send(doc.token);
};


// POST /cotoken
const storeToken = async (req, res, next) => {
  const { token, contentOutlet } = req.body;

  console.log(`token: ${JSON.stringify(token)}`);
  console.log(`contentOutlet: ${contentOutlet}`);

  const newToken = new COToken({ token, contentOutlet });

  await newToken.save();

  await res.send(newToken.toObject({ depopulate: true }));
};

// PATCH /cotoken
const updateToken = async (req, res, next) => {
  const { token, contentOutlet } = req.body;

  let coToken;

  coToken = await COToken.findOne({ contentOutlet });

  if (!token)
    coToken = new COToken({ token, contentOutlet });

  coToken.token = token;

  await coToken.save();

  await res.send(coToken.toObject({ depopulate: true }));
};

module.exports = {
  getToken,
  storeToken,
  updateToken
};
