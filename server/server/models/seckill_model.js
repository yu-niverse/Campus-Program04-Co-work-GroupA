const { pool } = require('./mysqlcon');
const redis = require('../../util/cache');
const { logger } = require('../../util/logger');  

const getSeckillProducts = async (pageSize, paging = 0, requirement = {}) => {
    const condition = { sql: '', binding: [] };
    if (requirement.category) {
        condition.sql = 'WHERE category = ?';
        condition.binding = [requirement.category];
    } else if (requirement.keyword != null) {
        condition.sql = 'WHERE title LIKE ?';
        condition.binding = [`%${requirement.keyword}%`];
    } else if (requirement.id != null) {
        condition.sql = 'WHERE id = ?';
        condition.binding = [requirement.id];
    }

    const limit = {
        sql: 'LIMIT ?, ?',
        binding: [pageSize * paging, pageSize],
    };

    const productQuery = 'SELECT * FROM seckill_products ' + condition.sql + ' ORDER BY id ' + limit.sql;
    const productBindings = condition.binding.concat(limit.binding);
    const [products] = await pool.query(productQuery, productBindings);

    const productCountQuery = 'SELECT COUNT(*) as count FROM seckill_products ' + condition.sql;
    const productCountBindings = condition.binding;

    const [productCounts] = await pool.query(productCountQuery, productCountBindings);

    return {
        products: products,
        productCount: productCounts[0].count,
    };
};

const getProductsVariants = async (productIds) => {
    const queryStr = 'SELECT * FROM seckill_variants INNER JOIN color ON seckill_variants.color_id = color.id WHERE product_id IN (?)';
    const bindings = [productIds];
    const [variants] = await pool.query(queryStr, bindings);
    return variants;
};

async function buyProduct(productId, userId, quantity) {
    const userKey = `user:${userId}:product:${productId}`;
    const inventoryKey = `product:${productId}:inventory`;
    logger.debug('quantity: ' + quantity);
    const multi = redis.multi();
    // Start the transaction
    await multi.get(inventoryKey);
    await multi.set(userKey, 'true');
    // Execute the transaction
    const results = await multi.exec();
    // Check if the inventory was greater than 0 before decrementing
    const stock = await parseInt(results[0][1], 10);
    logger.debug('stock: ' + stock);
    if (stock >= quantity) {
        // store user purchase information in Redis
        const USER_PURCHASE_PREFIX = 'user';
        const userPurchaseKey = `${USER_PURCHASE_PREFIX}:${userId}:product:${productId}`;
        await redis.set(userPurchaseKey, {
            productId,
            userId,
        });
        await multi.decrby(inventoryKey, quantity);
        return quantity;
    } else {
        return 0; // not enough inventory
    }
}

async function syncPurchaseDataToDB() {
    const USER_PURCHASE_PREFIX = 'user';
    const keys = await redis.keys(`${USER_PURCHASE_PREFIX}:*`);
    const pipeline = redis.pipeline();
    const connection = await pool.getConnection();
    try {
        for (const key of keys) {
            await pipeline.hgetall(key);
            const match = key.match(/user:(\d+):product:(\d+)/);
            const userId = match[1];
            const productId = match[2];
            if (match) {
                const checkOrderQuery = 'SELECT * FROM order_seckills WHERE userId = ? AND productId = ?';
                const [existingOrder] = await connection.execute(checkOrderQuery, [userId, productId]);
                if (existingOrder.length < 1) {
                    await connection.beginTransaction();
                    const insertQuery = 'INSERT IGNORE INTO order_seckills (userId, productId, created) VALUES (?, ?,  NOW())';
                    logger.info(`insert to order_seckills, 'user:${userId}, product:${productId}`);
                    await connection.execute(insertQuery, [userId, productId]);
                    const inventoryKey = `product:${productId}:inventory`;
                    const currentStock = await redis.get(inventoryKey);
                    logger.info(`product:${productId}, current stock: ${currentStock}`);
                    const updateStockQuery = 'UPDATE seckill_variants SET stock = ? WHERE product_id = ?';
                    await connection.execute(updateStockQuery, [currentStock, productId]);
                    await connection.commit();
                }
            }
        }
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function updateStock(productId) {
    const inventoryKey = `product:${productId}:inventory`;
    const currentStock = await redis.get(inventoryKey);
    logger.debug('product:', productId, ' current stock:', currentStock);
    if (currentStock >= 0 && currentStock != null) {
        const updateStockQuery = 'UPDATE seckill_variants SET stock = ? WHERE product_id = ?';
        await pool.query(updateStockQuery, [currentStock, productId]);
    }
}

//如果redis沒有庫存資料，就去DB查詢
async function syncProductInventoryToRedis(productId) {
    try {
        const getProductInventoryQuery = 'SELECT stock FROM seckill_variants WHERE product_id = ?';
        const productRow = await pool.query(getProductInventoryQuery, [productId]);
        const stock = productRow[0][0].stock;
        await redis.set(`product:${productId}:inventory`, stock);
    } catch (error) {
        logger.error(`Failed to sync product inventory to Redis: ${error}`);
    }
}

//從Redis取得現有商品庫存
async function getProductInventory(productId) {
    const inventoryKey = `product:${productId}:inventory`;
    let stock = await redis.get(inventoryKey);
    if (!stock || stock == null || stock === 0) {
        await syncProductInventoryToRedis(productId);
        stock = await redis.get(inventoryKey);
    }
    return stock;
}

module.exports = {
    getSeckillProducts,
    getProductsVariants,
    updateStock,
    buyProduct,
    syncPurchaseDataToDB,
    getProductInventory,
};
