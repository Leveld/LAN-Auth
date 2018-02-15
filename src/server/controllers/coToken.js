const axios = require('axios');
const { USER_ERROR, authServerIP, throwError } = require('capstone-utils');
const { google } = require('googleapis');
const { COToken } = require('../models');

const OAuth2Client = google.auth.OAuth2;
const oauth2Client = new OAuth2Client(
  '660421589652-k537cl8vg3v8imub4culbjon6f20fph6.apps.googleusercontent.com',
  'yYuc3V2fIT4DOfnZXIyhBvsh',
  'http://localhost:3002/oauth'
);

const error = (name, message, status = USER_ERROR) => {
  const error = new Error(message);
  error.name = name;
  error.status = status;
  throw error;
};

const getToken = async (req, res, next) => {
  const { contentOutlet } = req.query;
  const doc = await COToken.findOne({ contentOutlet });

  if (!doc)
    error('AuthCoToken', 'No Token found for specified ContentOutlet.');

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

  await res.send(token.toObject({ depopulate: true }));
};

const storeToken = async (req, res, next) => {
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
  storeToken
};
