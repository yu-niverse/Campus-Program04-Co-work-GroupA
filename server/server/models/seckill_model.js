const {pool} = require('./mysqlcon');

const getSeckillProducts = async (product_id) => {        

    const productQuery = 'SELECT * FROM seckill_products ORDER BY product_id ' ;
    const [productCounts] = await pool.query(productQuery, [product_id]);

    return {
        'products': products,
        'productCount': productCounts[0].count
    };
};

module.exports = {
    getSeckillProducts
}