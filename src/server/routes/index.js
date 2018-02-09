// Express server
const express = require('express');
// Exporess router
const router = express.Router();

// Subroutes
const callbacks = require('./callback.js');
const storage = require('./storage.js');

// Callback for User Authentication
router.use('/login', callbacks.credentialsRouter);
// OAuth callback for User Authentication
router.use('/oauth', callbacks.authRouter);
// Auth DB /storeToken
router.use('/token', storage.tokenAuth);
router.use('/tokenExpired', storage.tokenExpired);

//router.use('/authenticate', autenticateSubroute);

//router.use('/login', loginSubroute);

module.exports = router;
