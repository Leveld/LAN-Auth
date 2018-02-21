const axios = require('axios');
const { asyncMiddleware, authServerIP, apiServerIP, dbServerIP, throwError } = require('capstone-utils');

const { AuthToken } = require('../models');

// GET /token
const getToken = async (req, res, next) => {
  // Get the token from the params
  const { token } = req.query;
  // If the token doesn't exist, error
  if (!token)
    throwError('AuthTokenError', 'Missing data. Must provide token.');
  // find the token in the database
  // couldn't figure out if you could use async/await with this
  const tokenDoc = await AuthToken.findOne({ 'token.token': token });
  // Send error if there was a not found or other error
  if (!tokenDoc)
    throwError('AuthTokenError', 'Token not found in AuthDB');
  // do the thing and return it
  // expired?
  if (new Date(tokenDoc.token.expires) <= Date.now()) {
    // remove the token
    await tokenDoc.remove();
    // return an error
    return await res.status(400).send({ status: false, message: 'Token expired' });
  }
  return await res.send(tokenDoc);
};

// POST /token
const storeToken = async (req, res, next) => {
  // Get the token and the email from the request
  const { token, email, emailVerified, expires } = req.body;
  // check to see if the values are there
  // Error if either does not exist:
  // return status error and error message
  // first, verify token
  if (!token || !email || typeof emailVerified !== 'boolean' || !expires)
    throwError('AuthTokenError', `Missing Data | received: ${JSON.stringify(req.body)}`);
  //TODO verify token
  //TODO verify email
  // Get userid for email

  let user = await axios.get(`${dbServerIP}user`, {
    params: {
      email
    }
  });
  if (user)
    user = user.data
  else
    throwError('AuthTokenError', 'Could not find user.');
  // const token = new Token({ token: { info }, user: { id: user.data._id, type: user.data.type } });
  // create schema data with values supplied
  const schemaData = {
    user: {
      userID: user._id,
      accountType: user.type,
      emailVerified: emailVerified
    },
    token: {
      token: token,
      expires: expires
    }
  };
  const newAuthToken = new AuthToken(schemaData);
  // Save it
  await newAuthToken.save();
  return await res.send(newAuthToken);
};

// PATCH /token
const updateToken = async (req, res, next) => {
  const { token, fields } = req.body;

  if(typeof token !== 'string' || typeof fields !== 'object')
    throwError('AuthTokenError', `Missing Data | received: ${JSON.stringify(req.body)}`);

  const authToken = await AuthToken.findOne({ 'token.token': token });
  if(!authToken)
    throwError('AuthTokenError', 'Could not find AuthToken');

  for (let [key, value] of Object.entries(fields)) {
    authToken[key] = value;
  }

  await authToken.save();
  await res.send(authToken.toObject({ depopulate: true }));
};


// GET /tokenExpired
const isTokenExpired = async (req, res, next) => {
  // Get the token from the query
  const { token } = req.query;
  // If the token doesn't exist, error
  if (!token)
    throwError('AuthTokenError', `Missing Data | received: ${JSON.stringify(req.query)}`);
  // find the token in the database
  const tokenData = await axios.get(`${authServerIP}/token`, { params: { token } });
  // check status of request for status of token
  if (!tokenData.status || !tokendata.token) return res.json({ status: false });
  // should be good
  await res.json({ status: true });
};

module.exports = {
  getToken,
  storeToken,
  updateToken,
  isTokenExpired
};
