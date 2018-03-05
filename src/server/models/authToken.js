const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
  user: {
    userID: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      require: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    }
  },
  token: {
    token: {
      type: String,
      required: true
    },
    expires: {
      type: Date,
      required: true
    }
  }
});

module.exports = mongoose.model('AuthToken', authTokenSchema);
