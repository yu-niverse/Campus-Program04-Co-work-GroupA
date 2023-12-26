const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  lineOAuthSuccessCallback,
  sendLineNotify,
  revokeLineNotify,
  startLineOauth,
  lineOAuthFailedCallback,
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

module.exports = router;