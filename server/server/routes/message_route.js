const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { USER_ROLE } = require('../models/user_model');

const { authentication } = require('../../util/util');

const { getMessages, getCustomerMessages } = require('../controllers/message_controller');

router.route('/messages').get(authentication(USER_ROLE.USER), wrapAsync(getMessages));

router.route('/customerMessages').get(wrapAsync(getCustomerMessages));

module.exports = router;
