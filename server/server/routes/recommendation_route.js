const router = require('express').Router();
const {wrapAsync} = require('../../util/util');
const { getCollections } = require('../controllers/recommendation_controller')


router.route('/recommendations')
    .get(wrapAsync(getCollections));

module.exports = router;
