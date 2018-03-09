const { asyncMiddleware } = require('capstone-utils');
const controllers = require('../controllers');


module.exports = (app) => {
  app
    .route('/cotoken')
    .get(asyncMiddleware(controllers.coToken.getToken))
    .post(asyncMiddleware(controllers.coToken.storeToken))
    .patch(asyncMiddleware(controllers.coToken.updateToken));
}
