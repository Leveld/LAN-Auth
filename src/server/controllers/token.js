const axios = require('axios');
const { asyncMiddleware, authServerIP, apiServerIP, dbServerIP } = require('capstone-utils');

const { AuthToken } = require('../models');

// GET /token
const getToken = async (req, res, next) => {
  try {
    // Get the token from the params
    const { token } = req.query;
    console.log(token)
    // If the token doesn't exist, error
    if (!token)
      return await res.status(400).json({ status: false, message: 'Missing Data' });
    // find the token in the database
    // couldn't figure out if you could use async/await with this
    const tokenDoc = await AuthToken.findOne({ 'token.token': token });
    // Send error if there was a not found or other error
    if (!tokenDoc)
      return await res.status(422).send({ status: false, message: 'Data Not Found' });
    // do the thing and return it
    // expired?
    if (new Date(tokenDoc.token.expires) <= Date.now()) {
      // remove the token
      await tokenDoc.remove();
      // return an error
      return await res.status(400).send({ status: false, message: 'Token expired' });
    }
    return await res.send(tokenDoc);
  } catch (error) {
    return await res.status(422).send({ status: false, message: 'Token malformed or does not exist' });
  }
};

// POST /token
const storeToken = async (req, res, next) => {
  // Get the token and the email from the request
  const { token, email, emailVerified, expires } = req.body;
  // check to see if the values are there
  // Error if either does not exist:
  // return status error and error message
  // first, verify token
  if (!token || !email || !emailVerified || !expires)
    await res.status(400).json({ status: false, message: 'Missing Data' });
  //TODO verify token
  //TODO verify email
  // Get userid for email
  try {
    let user = await axios.get(`${dbServerIP}user`, {
      params: {
        email
      }
    });
    if (user)
      user = user.data
    else
      throw new Error();
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
  } catch (error) {
    return await res.status(400).json({ status: false, message: 'Missing Data' });
  }
};


// GET /tokenExpired
// I don't think we need this since GET /token will return an error saying a token
// is expired.
// const isTokenExpired = async (req, res, next) => {
//   try {
//     // Get the token from the params
//     const { token } = req.params;
//     // If the token doesn't exist, error
//     if (!token) await re.status(400).json({ status: false, message: 'Missing Data' });
//     // find the token in the database
//     const tokenData = await axios.get(`${authServerIP}/token`, { params: { token } });
//     // check status of request for status of token
//     if (!tokenData.status || !tokendata.token) return res.json({ status: false });
//     // should be good
//     await res.json({ status: true });
//   } catch (error) {
//     return await res.status(422).json({ status: false, message: 'Token malformed or does not exist' });
//   }
// };

module.exports = {
  getToken,
  storeToken
};
