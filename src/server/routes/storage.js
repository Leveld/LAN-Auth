/********************************
 * Storage routes
 * @route:post /storeToken
 ********************************/
// Express server
const express = require('express');
// Mongoose MongoDB
const mongoose = require('mongoose');
// Exporess router
const router = express.Router();
// Data Models
const { AuthToken } = require('../models');
// util Variables
const { authDBIP } = require('../util');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + authDBIP, { useMongoClient: true });

// Post /storeToken
router.post('/', (req, res) => {
  // Get the toke and the email from the request
  const { token, email, userid } = req.body;
  // check to see if the values are there
  // Error if either does not exist:
  // return status error and error message
  // first, verify token
  if (!token) return res.status(400).json({ status: false, error: 'Missing Data' });
  // then, check to see if there is an email or userid, return false if neither
  if (!email && !userid) return res.status(400).json({ status: false, error: 'Missing Data' });
  //TODO verify token
  //TODO verify email
  //TODO verify userid
  // Request provided values, now time to check to see if anything matches
  // produce a query string
  if (!userid) {
    // Construct an email query string
    const query = { email };
  } else {
    // Construct a userid query string
    const query = { id: userid };
  }
  // Get the query and update
  AuthToken.findOneAndUpdate(query, { token })
  .then((user) => {
    // Should be a success
    console.log(user);
    return res.json({ status: true });
  })
  .catch((err) => {
    // something went wrong
    return res.status(422).json({ status: false, error: 'Unknown User' });
  });
});

module.exports = router;
