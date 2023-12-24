const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  lineOAuthCallback,
  sendLineNotify,
  revokeLineNotify,
  startLineOauth,
} = require('../controllers/line_controller');

router.route('/start-line-oauth')
  .get(wrapAsync(startLineOauth))

router.route('/line/oauth/callback')
  .post(wrapAsync(lineOAuthCallback));

router.route('/line/notify')
  .post(wrapAsync(sendLineNotify));

router.route('/line/notify/revoke')
  .post(wrapAsync(revokeLineNotify));

module.exports = router;