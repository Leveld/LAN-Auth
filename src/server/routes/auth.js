const { asyncMiddleware } = require('capstone-utils');
const controllers = require('../controllers');

module.exports = (app) => {
  app
    .route('/oauth')
    .get(asyncMiddleware(controllers.auth.getOAuth));

  app
    .route('/login')
    .get(asyncMiddleware(controllers.auth.loginCallback));
};
