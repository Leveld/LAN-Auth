const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { IS_PRODUCTION } = require('capstone-utils');

const routes = require('./routes');

// initialize models
const { AuthToken } = require('./models');

const PORT = process.env.PORT || '3002';

mongoose.Promise = global.Promise;
if (IS_PRODUCTION)
  mongoose.connect('mongodb://process.env.DBUSER:process.env.DBPASSWORD@ds147274.mlab.com:47274/heroku_nf63v9rv');
else
  mongoose.connect('mongodb://localhost:2000/capstone-auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Running in ' + (process.env.PRODUCTION ? 'Production' : 'Development'));
});

module.exports = app;
