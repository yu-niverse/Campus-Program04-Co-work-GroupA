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
    multi.get(inventoryKey);

    multi.set(userKey, 'true');

    // Execute the transaction
    const results = await multi.exec();

    // Check if the inventory was greater than 0 before decrementing
    const inventoryBeforeDecrement = parseInt(results[0][1], 10);
    console.log('inventoryBeforeDecrement: ' + inventoryBeforeDecrement);
    if (inventoryBeforeDecrement >= quantity) {
        // Success, store user purchase information in Redis
        const USER_PURCHASE_PREFIX = 'user';
        const userPurchaseKey = `${USER_PURCHASE_PREFIX}:${userId}:product:${productId}`;
        redis.set(userPurchaseKey, {
            productId,
            userId,
            quantity,
            timestamp: Date.now(),
        });
        multi.decrby(inventoryKey, quantity);
        return quantity;
    } else {
        return 0; // Failure, not enough inventory
    }
};

async function syncPurchaseDataToDB() {
    const interval = 5000;

    // 定義同步函數
    const syncFunction = async () => {
        const USER_PURCHASE_PREFIX = 'user';
        // 查询 Redis 中的所有用户搶購信息
        const keys = await redis.keys(`${USER_PURCHASE_PREFIX}:*`);
        const pipeline = redis.pipeline();
        const connection = await pool.getConnection();
        let currentStock;
        let productId
        for (const key of keys) {
            try {
                await pipeline.hgetall(key);  // 使用 await 等待 pipeline 完成
                const match = key.match(/user:(\d+):product:(\d+)/);
                if (match) {
                    const userId = match[1];
                    const productId = match[2];

                    const checkOrderQuery = 'SELECT * FROM order_seckills WHERE userId = ? AND productId = ?';
                    const [existingOrder] = await connection.execute(checkOrderQuery, [userId, productId]);
                    if (!existingOrder.length)  {
                        await connection.beginTransaction();
                        const insertQuery = 'INSERT INTO order_seckills (userId, productId) VALUES (?, ?)';
                        // console.log("insert to order_seckills", userId,productId);
                        await connection.execute(insertQuery, [userId, productId]);
                        // await redis.del(key);
                        await connection.commit();
                    }

                    
                }
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        // 等待當前的迴圈操作完成後再進行下一個步驟
        for (const key of keys) {
            const match = key.match(/user:(\d+):product:(\d+)/);
            if (match) {
                productId = match[2];
                const inventoryKey = `product:${productId}:inventory`;
                currentStock = await redis.get(inventoryKey);
                console.log("currentStock", currentStock, productId);
                // 在這裡處理 currentStock
            }
        }
        if (productId != null){
            const updateStockQuery = 'UPDATE seckill_variants SET stock = ? WHERE product_id = ?';
            await connection.execute(updateStockQuery, [currentStock, productId]);
        }
        
    };

    // 開始定期執行同步函數
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

// 在需要商品庫存時，先從 Redis 中取得，如果沒有再同步庫存到 Redis
async function getProductInventory(productId) {
    const inventoryKey = `product:${productId}:inventory`;
    let stock = await redis.get(inventoryKey);
    if (stock === null) {
        // 如果 Redis 中沒有庫存，則同步庫存到 Redis
        await syncProductInventoryToRedis(productId);
        // 再從 Redis 中取得庫存
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