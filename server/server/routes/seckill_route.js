const router = require('express').Router();
const {wrapAsync} = require('../../util/util');

const {
    Seckill, getProducts
} = require('../controllers/seckill_controller');

router.route('/seckill/:productId/:userId')
    .post(wrapAsync(Seckill));


router.route('/seckill/:category')
.get(wrapAsync(getProducts));


module.exports = router;
