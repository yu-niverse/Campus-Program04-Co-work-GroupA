const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  lineOAuthCallback,
  lineNotify,
  revokeLineNotify
} = require('../controllers/line_controller');

router.route('/line/oauth/callback')
  .post(wrapAsync(lineOAuthCallback));


router.route('/line/notify')
  .post(wrapAsync(lineNotify));

router.route('/line/notify/revoke')
  .post(wrapAsync(revokeLineNotify));

module.exports = router;