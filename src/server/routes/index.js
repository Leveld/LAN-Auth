const authRoutes = require('./auth');
const coTokenRoutes = require('./coToken');
const tokenRoutes = require('./token');

module.exports = (app) => {
  authRoutes(app);
  coTokenRoutes(app);
  tokenRoutes(app);
};
