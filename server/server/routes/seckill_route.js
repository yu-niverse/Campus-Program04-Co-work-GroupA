const router = require('express').Router();
const {wrapAsync} = require('../../util/util');

const {
    Seckill,
} = require('../controllers/seckill_controller');

router.route('/seckill/:productId/:userId')
    .post(wrapAsync(Seckill));

module.exports = router;
