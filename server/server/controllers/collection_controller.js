const _ = require('lodash');
const Collection = require('../models/collection_model');

const addCollection = async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).send({ message: 'No user id or product id' });
    }
    const collectionId = await Collection.createCollection(userId, productId);

    return res.status(200).send({ collectionId });
};

const removeCollection = async (req, res) => {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
        return res.status(400).send({ message: 'No user id or product id' });
    }

    await Collection.deleteCollection(userId, productId);

    return res.status(200).send({ message: 'Delete successfully' });
};

const checkCollection = async (req, res) => {
    const { userId, productId } = req.query;

    if (!userId || !productId) {
        return res.status(400).send({ message: 'No user id or product id' });
    }

    const result = await Collection.findOneCollection(userId, productId);

    const userLike = result.length === 1 ? true : false;

    return res.status(200).send({ userLike });
};

const getAllByUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).send({ message: 'No user id' });
    }

    const collections = await Collection.getAllCollectionsByUser(userId);

    return res.status(200).send(collections);
};

module.exports = { addCollection, removeCollection, checkCollection, getAllByUser };
