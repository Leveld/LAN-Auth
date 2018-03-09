const { asyncMiddleware } = require('capstone-utils');
const controllers = require('../controllers');

module.exports = (app) => {
  app
    .route('/coURL')
    .get(asyncMiddleware(controllers.auth.generateURL));

  app
    .route('/goauth')
    .get(asyncMiddleware(controllers.auth.googleCallback));

  app
    .route('/login')
    .get(asyncMiddleware(controllers.auth.loginCallback));
};
