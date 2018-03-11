const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { IS_PRODUCTION } = require('capstone-utils');

const routes = require('./routes');

const USE_HEROKU = (() => {
  if (typeof process.env.USE_HEROKU === 'string') {
    if (process.env.USE_HEROKU.toLowerCase() === 'true')
      return true;
  }
  if (process.env.USE_HEROKU === 1 || process.env.USE_HEROKU === true)
    return true;
  return false;
})();

// initialize models
const { AuthToken, COToken } = require('./models');

const PORT = process.env.PORT || '3002';

mongoose.Promise = global.Promise;
if (USE_HEROKU)
  mongoose.connect(`${process.env.MONGODB_URI}`);
else
  mongoose.connect('mongodb://localhost:2000/capstone-auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/wat', (req, res) => res.send(IS_PRODUCTION ? 'Production' : 'Development'));

routes(app);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Running in ' + (process.env.PRODUCTION ? 'Production' : 'Development'));
});

module.exports = app;
