const mongoose = require('mongoose');
const { authDBIP } = require('../util');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + authDBIP);

const authTokenSchema = new mongoose.Schema({
  user: {
    userID: { type: String, required: true },
    accountType: { type: String, require: true },
    emailVerified: {type: Boolean, default: false}
  },
  token: {
    token: {type: String, required: true},
    expires: {type: Date, required: true}
  }
});

module.exports = mongoose.model('authToken', authTokenSchema);
