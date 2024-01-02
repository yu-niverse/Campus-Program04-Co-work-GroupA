const router = require('express').Router();
const { wrapAsync, authentication } = require('../../util/util');

const {
  lineOAuthSuccessCallback,
  sendLineNotify,
  revokeLineNotify,
  startLineOauth,
  lineOAuthFailedCallback,
  addNotifyProduct,
} = require('../controllers/line_controller');

router.route('/start-line-oauth')
  .get(startLineOauth)

router.route('/line/oauth/callback')
  .get(lineOAuthFailedCallback)
  .post(wrapAsync(lineOAuthSuccessCallback));

router.route('/line/notify')
  .post(wrapAsync(sendLineNotify));

router.route('/line/notify/revoke')
  .post(wrapAsync(revokeLineNotify));

router.route('/line/notify/product/:id')
  .post(authentication(), wrapAsync(addNotifyProduct));

module.exports = router;