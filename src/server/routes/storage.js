/********************************
 * Storage routes
 * @route:post /storeToken
 ********************************/
// Express server
const express = require('express');
// Mongoose MongoDB
const mongoose = require('mongoose');
// Axios
const axios = require('axios');
// Exporess router
const router = express.Router();
// Data Models
const { AuthToken } = require('../models');
// util Variables
const { asyncMiddleware, authDBIP, authServerIP, apiServerIP } = require('../util');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + authDBIP, { useMongoClient: true });


// POST /storeToken
router.post('/token', asyncMiddleware(async (req, res, next) => {
  // Get the toke and the email from the request
  const { token, email } = req.body;
  // check to see if the values are there
  // Error if either does not exist:
  // return status error and error message
  // first, verify token
  if (!token || !email) await res.status(400).json({ status: false, message: 'Missing Data' });
  //TODO verify token
  //TODO verify email
  // Get userid for email
  try {
    const user = await axios.get(`${apiServerIP}/user`, {
      params: {
        email
      }
    });
    // const token = new Token({ token: { info }, user: { id: user.data._id, type: user.data.type } });
    // create schema data with values supplied
    const schemaData = {
      user: {
        userid: user._id,
        accountType: user.accountType,
        emailVerified: user.emailVerified
      },
      token: {
        token,
        expires: new Date((new Date() / 1) + (1000 * expires_in)).toISOString()
      }
    };
    const newAuthToken = new AuthToken(schemaData);
    // Save it
    await newAuthToken.save();
  } catch (error) {
    // handle no user found error
    return await res.status(400).json({ status: false, message: 'Missing Data' });
  }
}));


// GET /token
// returns info
router.get('/token', asyncMiddleware(async (req, res, next) => {
  try {
    // Get the token from the params
    const { token } = req.params;
    // If the token doesn't exist, error
    if (!token) await re.status(400).json({ status: false, message: 'Missing Data' });
    // find the token in the database
    // couldn't figure out if you could use async/await with this
    AuthToken.findOne().select({ 'token.token' : token }).exec((err, tokenDoc) => {
      // Send error if there was a not found or other error
      if (err) return res.status(422).json({ status: false, message: 'Data Not Found' });
      // do the thing and return it
      // expired?
      if (new Date(tokenDoc.token.expires) <= Date.now()) {
        // remove the token
        tokenDoc.remove();
        // return an error
        res.status(400).json({ status: false, message: 'Token expired' });
      }
      return res.json({ status: true, token: tokenDoc.token.token });
    });
  } catch (error) {
    return await res.status(422).json({ status: false, message: 'Token malformed or does not exist' });
  }
}));


// GET /tokenExpired
// Returns a boolean
router.get('/tokenExpired', asyncMiddleware(async (req, res, next) => {
  try {
    // Get the token from the params
    const { token } = req.params;
    // If the token doesn't exist, error
    if (!token) await re.status(400).json({ status: false, message: 'Missing Data' });
    // find the token in the database
    const tokenData = await axios.get(`${authServerIP}/token`, { params: { token } });
    // check status of request for status of token
    if (!tokenData.status || !tokendata.token) return res.json({ status: false });
    // should be good
    await res.json({ status: true });
  } catch (error) {
    return await res.status(422).json({ status: false, message: 'Token malformed or does not exist' });
  }
}));

module.exports = router;
