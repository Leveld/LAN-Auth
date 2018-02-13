module.exports = (app) => {
  app
    .route('/cotoken')
    .get(asyncMiddleware(controllers.coToken.getToken))
    .post(asyncMiddleware(controllers.coToken.storeToken))
}
