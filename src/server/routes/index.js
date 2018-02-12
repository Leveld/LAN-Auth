const authRoutes = require('./auth');
const tokenRoutes = require('./token');

module.exports = (app) => {
  authRoutes(app);
  tokenRoutes(app);
};
