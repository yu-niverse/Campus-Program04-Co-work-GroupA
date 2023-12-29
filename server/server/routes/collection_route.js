const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { addCollection, removeCollection, checkCollection, getAllByUser } = require('../controllers/collection_controller');

router.route('/collection/add').post(wrapAsync(addCollection));

router.route('/collection/remove').delete(wrapAsync(removeCollection));

router.route('/collection/check').get(wrapAsync(checkCollection));

router.route('/collection/getAll/:userId').get(wrapAsync(getAllByUser));

module.exports = router;
