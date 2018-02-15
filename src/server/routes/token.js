const { asyncMiddleware } = require('capstone-utils');
const controllers = require('../controllers');

module.exports = (app) => {
  app
    .route('/token')
    .get(asyncMiddleware(controllers.token.getToken))
    .post(asyncMiddleware(controllers.token.storeToken));
    .patch(asyncMiddleware(controllers.token.updateToken))

    app
    .route('/tokenExpired')
    .get(asyncMiddleware(controllers.token.isTokenExpired))
};
