const router = require('express').Router();
const {wrapAsync} = require('../../util/util');
const {  getRecommendations } = require('../controllers/recommendation_controller')


router.route('/recommendations')
    .get(wrapAsync(getRecommendations));


module.exports = router;
