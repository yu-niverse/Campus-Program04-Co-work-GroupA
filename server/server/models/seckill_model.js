const {pool} = require('./mysqlcon');
const redis = require('../../util/cache');

const getSeckillProducts = async (product_id) => {        

    const productQuery = 'SELECT * FROM seckill_products ORDER BY product_id ' ;
    const [productCounts] = await pool.query(productQuery, [product_id]);

    return {
        'products': products,
        'productCount': productCounts[0].count
    };
};


async function buyProduct(productId, userId, quantity) {
    const userKey = `user:${userId}:product:${productId}`;
    const inventoryKey = `product:${productId}:inventory`;
    console.log('quantity: ' + quantity);
    const multi = redis.multi();
    // Start the transaction
    await multi.get(inventoryKey);
    await multi.set(userKey, 'true');
    // Execute the transaction
    const results = await multi.exec();
    // Check if the inventory was greater than 0 before decrementing
    const stock = await parseInt(results[0][1], 10);
    console.log('inventoryBeforeDecrement: ' + stock);
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
};

async function syncPurchaseDataToDB() {
    const interval = 5000;

    const syncFunction = async () => {
        const USER_PURCHASE_PREFIX = 'user';
        const keys = await redis.keys(`${USER_PURCHASE_PREFIX}:*`);
        const pipeline = redis.pipeline();
        const connection = await pool.getConnection();
        let currentStock;
        let productId
        for (const key of keys) {
            try {
                await pipeline.hgetall(key); 
                const match = key.match(/user:(\d+):product:(\d+)/);
                const userId = match[1];
                const productId = match[2];
                if (match) {
                    const checkOrderQuery = 'SELECT * FROM order_seckills WHERE userId = ? AND productId = ?';
                    const [existingOrder] = await connection.execute(checkOrderQuery, [userId, productId]);
                    console.log("existingOrder", userId, productId,existingOrder.length);
                    if (existingOrder.length < 1)  {
                        await connection.beginTransaction();
                        const insertQuery = 'INSERT IGNORE INTO order_seckills (userId, productId) VALUES (?, ?)';
                        // console.log("insert to order_seckills", userId,productId);
                        await connection.execute(insertQuery, [userId, productId]);
                        // await redis.del(key);
                        await connection.commit();
                    }
                    
                };
                // const inventoryKey = `product:${productId}:inventory`;
                // const currentStock = await redis.get(inventoryKey);
                // console.log("currentStock", currentStock, productId);
                // if (productId != null){
                //     const updateStockQuery = 'UPDATE seckill_variants SET stock = ? WHERE product_id = ?';
                //     await connection.execute(updateStockQuery, [currentStock, productId]);
                // };
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        for (const key of keys) {
            const match = key.match(/user:(\d+):product:(\d+)/);
            if (match) {
                productId = match[2];
                const inventoryKey = `product:${productId}:inventory`;
                currentStock = await redis.get(inventoryKey);
                console.log("currentStock", currentStock, productId);
                if (productId != null){
                    const updateStockQuery = 'UPDATE seckill_variants SET stock = ? WHERE product_id = ?';
                    await connection.execute(updateStockQuery, [currentStock, productId]);
                }
            }
        }
        
        
    };

    setInterval(syncFunction, interval);
};

async function syncProductInventoryToRedis(productId) {
    try {
        const getProductInventoryQuery = 'SELECT stock FROM seckill_variants WHERE product_id = ?';
        const productRow = await pool.query(getProductInventoryQuery, [productId]);
        const stock = productRow[0][0].stock;
        console.log('stock in function', stock);
        await redis.set(`product:${productId}:inventory`, stock);
    } catch (error) {
        console.error(`Failed to sync product inventory to Redis: ${error}`);
    }
}

async function getProductInventory(productId) {
    const inventoryKey = `product:${productId}:inventory`;
    let stock = await redis.get(inventoryKey);
    console.log(stock)
    if (!stock || stock == null) {
        await syncProductInventoryToRedis(productId);
        stock = await redis.get(inventoryKey);
        
    }

    return stock;
}



module.exports = {
    getSeckillProducts,
    buyProduct,
    syncPurchaseDataToDB,
    getProductInventory
}