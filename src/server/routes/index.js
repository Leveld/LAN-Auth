// Express server
const express = require('express');
// Exporess router
const router = express.Router();

// Subroutes
const authenticateSubroute = require('./authenticate.js');
const loginSubroute = require('./login.js');
const callbacks = require('./callback.js');
const storage = require('./storage.js');

// Callback for User Authentication
router.use('/login', callbacks.credentialsRouter);
// OAuth callback for User Authentication
router.use('/oauth', callbacks.authRouter);
// Auth DB /storeToken
router.use('/storeToken', storage);

//router.use('/authenticate', autenticateSubroute);

//router.use('/login', loginSubroute);

module.exports = router;
