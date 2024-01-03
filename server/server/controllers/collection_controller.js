const _ = require('lodash');
const Collection = require('../models/collection_model');
const { logger } = require('../../util/logger.js');

const addCollection = async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        logger.error('No user id or product id');
        return res.status(400).send({ message: 'No user id or product id' });
    }
    const collectionId = await Collection.createCollection(userId, productId);

    logger.info(`Add collection ${productId} to user ${userId}`);
    return res.status(200).send({ collectionId });
};

const removeCollection = async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        logger.error('No user id or product id');
        return res.status(400).send({ message: 'No user id or product id' });
    }

    await Collection.deleteCollection(userId, productId);

    logger.info(`User ${userId} delete product ${productId} in their collections`);
    return res.status(200).send({ message: 'Delete successfully' });
};

const checkCollection = async (req, res) => {
    const { userId, productId } = req.query;

    if (!userId || !productId) {
        logger.error('No user id or product id');
        return res.status(400).send({ message: 'No user id or product id' });
    }

    const result = await Collection.findOneCollection(userId, productId);

    const userLike = result.length === 1 ? true : false;

    logger.info(`User ${userId} like ${productId}? ${userLike}`);
    return res.status(200).send({ userLike });
};

const getAllByUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        logger.error('No user id');
        return res.status(400).send({ message: 'No user id' });
    }

    const collections = await Collection.getAllCollectionsByUser(userId);

    logger.info(`Get all collections by user ${userId}: ${collections}`);
    return res.status(200).send(collections);
};

module.exports = { addCollection, removeCollection, checkCollection, getAllByUser };
