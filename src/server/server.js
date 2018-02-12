const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const routes = require('./routes');

// initialize models
const { AuthToken } = require('./models');

const PORT = process.env.PORT || '3002';

mongoose.Promise = global.Promise;
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
