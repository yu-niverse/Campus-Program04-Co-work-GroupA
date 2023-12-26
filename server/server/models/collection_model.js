const { pool } = require('./mysqlcon');

const createCollection = async (userId, productId) => {
    const [result] = await pool.query(`INSERT INTO collections(user_id, product_id) VALUES(${userId}, ${productId});`);
    return result.insertId;
};

const findOneCollection = async (userId, productId) => {
    const [result] = await pool.query(`SELECT * FROM collections WHERE user_id = ${userId} AND product_id = ${productId} LIMIT 1;`);
    return result;
};

const deleteCollection = async (userId, productId) => {
    const [result] = await pool.query(`DELETE FROM collections WHERE user_id = ${userId} AND product_id = ${productId};`);
    return result.insertId;
};

const getAllCollectionsByUser = async (userId) => {
    const [result] = await pool.query(`SELECT * FROM collections WHERE user_id = ${userId};`);
    return result;
};

module.exports = {
    createCollection,
    findOneCollection,
    deleteCollection,
    getAllCollectionsByUser,
};
