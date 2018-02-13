const axios = require('axios');
const { USER_ERROR, authServerIP } = require('capstone-utils');

const { COToken } = require('../models');

const error = (name, message, status = USER_ERROR) => {
  const error = new Error(message);
  error.name = name;
  error.status = status;
  throw error;
};

const getToken = async (req, res, next) => {
  const { contentOutlet } = req.body;
  const token = await COToken.findOne({ contentOutlet });

  if (!token)
    error('AuthCoToken', 'No Token found for specified ContentOutlet.');

  res.send(token.toObject({ depopulate: true }));
};

const storeToken = async (req, res, next) => {
  const { token, contentOutlet } = req.body;

  let coToken;

  coToken = await COToken.findOne({ contentOutlet });

  if (!token)
    coToken = new COToken({ token, contentOutlet });

  coToken.token = token;

  await coToken.save();

  res.send(coToken.toObject({ depopulate: true }));
};

module.exports = {
  getToken,
  storeToken
};
