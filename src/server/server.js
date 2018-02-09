const express = require('express');
const bodyParser = require('body-parser');

// Routes
const apiRoutes = require('./routes');

const path = require('path');

const { USER_ERROR, asyncMiddleware, errorHandler, authServerIP } = require('./util');

const PORT = process.env.PORT || 3002;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* example async route handler
  app.get('/', asyncMiddleware(async (req, res, next) => {
    await res.sendFile(path.resolve(__dirname, '../public/index.html'));
  }));
*/

app.use('/', apiRoutes);

app.get('/banana', (req, res) => {
  console.log('banana');
  console.log(req.body);
  res.send({ banana: new Date() / 1 });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Running in ' + (process.env.PRODUCTION ? 'Production' : 'Development'));
});

module.exports = app;
