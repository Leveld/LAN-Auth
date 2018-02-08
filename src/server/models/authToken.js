const mongoose = require('mongoose');
const { authDBIP } = require('../util');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + authDBIP, { useMongoClient: true });

const authTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  userID: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('authToken', authTokenSchema);
