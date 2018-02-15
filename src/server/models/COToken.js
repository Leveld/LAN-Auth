const mongoose = require('mongoose');

const COToken = mongoose.Schema({
  token: {
    token: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    expires: {
      type: Date,
      required: true
    }
  },
  contentOutlet: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('COToken', COToken);
