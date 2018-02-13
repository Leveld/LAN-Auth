const mongoose = require('mongoose');

const COToken = mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  contentOutlet: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('COToken', COToken);
