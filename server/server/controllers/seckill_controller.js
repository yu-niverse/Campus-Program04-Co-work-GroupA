const { buyProduct, syncPurchaseDataToDB,getProductInventory,updateStock } = require('../models/seckill_model');
const { pool } = require('../models/mysqlcon');
const redis = require('../../util/cache');
const schedule = require('node-schedule')

let isAppInitialized = false;

async function initializeApp(productId) {
    await getProductInventory(productId);
    const job = schedule.scheduleJob('*/5 * * * * *', async function() {
        await updateStock(productId);
    });
    isAppInitialized = true;
}

syncPurchaseDataToDB();
// updateStock(productId);



async function Seckill(req, res) {
    const { productId, userId } = req.params;
    console.log('productId', productId);
    const quantity = 1;
    if (!isAppInitialized) {
        await initializeApp(productId);
    }
    try {
        const userKey = `user:${userId}:product:${productId}`;
        const hasPurchased = await redis.get(userKey);
        if (hasPurchased) {
            return res.status(400).json({ error: '已經搶購過該商品' });
        }
    } catch (e) {
        console.error(e);
    }
    const userKey = `user:${userId}:product:${productId}`;
    const script = `
      local inventory = tonumber(redis.call('get', 'product:${productId}:inventory') or 0)
      if inventory > 0 then
        redis.call('decr', 'product:${productId}:inventory')
        redis.call('set', '${userKey}', 'true')
        return 1
      else
        return 0
      end
    `;

    const result = await redis.eval(script, 0);
    console.log('result', result);
    if (result === 1) {
        const lockResult = await buyProduct(productId, userId, quantity);
        console.log('lockResult', lockResult);
        if (lockResult > 0) {
            const USER_PURCHASE_PREFIX = 'user';
            const userPurchaseKey = `${USER_PURCHASE_PREFIX}:${userId}:product:${productId}`;
            await redis.set(userPurchaseKey, 'true');
        }

        return res.json({ success: true, message: `user:${userId} 搶購成功` });
    } else {
        console.log({ error: '庫存不足，搶購失敗' });
        return res.status(400).json({ error: '庫存不足，搶購失敗' });
    }
}

// async function buyProduct(productId, userId, quantity) {
//     const userKey = `user:${userId}:product:${productId}`;
//     const inventoryKey = `product:${productId}:inventory`;

//     const multi = redis.multi();

//     // Start the transaction
//     multi.get(inventoryKey);
//     multi.decr(inventoryKey);
//     multi.set(userKey, 'true');

//     // Execute the transaction
//     const results = await multi.exec();

//     // Check if the inventory was greater than 0 before decrementing
//     const inventoryBeforeDecrement = parseInt(results[0][1], 10);
//     if (inventoryBeforeDecrement >= quantity) {
//       return quantity; // Success, return the quantity
//     } else {
//       return 0; // Failure, not enough inventory
//     }
//   }

// const updateStockQuery = 'UPDATE seckill_variants SET stock = stock - ? WHERE product_id = ?';
// async function checkAndUpdateStock(productId, quantity) {
//     const connection = await pool.getConnection();

//     try {
//         await connection.beginTransaction();

//         const currentStockQuery = 'SELECT stock FROM seckill_variants WHERE product_id = ?';
//         const [currentStockResult] = await connection.query(currentStockQuery, [productId]);
//         const currentStock = currentStockResult[0].stock;
//         // out of stock
//         if (currentStock < quantity) {
//             await connection.rollback();
//             return false;
//         }

//         await connection.query(updateStockQuery, [quantity, productId]);

//         await connection.commit();
//         return true;
//     } catch (error) {
//         await connection.rollback();
//         throw error;
//     } finally {
//         connection.release();
//     }
// }

// async function Seckill(req, res) {
//     const { productId, userId } = req.params;
//     console.log('productId', productId);
//     const quantity = 1;
//     const conn = await pool.getConnection();
//     try {
//         const getProductInventoryQuery = 'SELECT stock FROM seckill_variants WHERE product_id = ?';
//         const productRow = await conn.query(getProductInventoryQuery, [productId]);
//         const stock = productRow[0][0].stock;
//         console.log('stock', stock);
//         redis.set(`product:${productId}:inventory`, stock);
//     } catch (e) {
//         throw e;
//     }

//     const userKey = `user:${userId}:product:${productId}`;
//     const hasPurchased = await redis.get(userKey);

//     if (hasPurchased) {
//         return res.status(400).json({ error: '已經搶購過該商品' });
//     }

//     const script = `
//       local inventory = tonumber(redis.call('get', 'product:${productId}:inventory') or 0)
//       if inventory > 0 then
//         redis.call('decr', 'product:${productId}:inventory')
//         redis.call('set', '${userKey}', 'true')
//         return 1
//       else
//         return 0
//       end
//     `;

//     const result = await redis.eval(script, 0);

//     if (result === 1) {
//         const lockResult = await buyProduct(productId, userId, quantity);
//         console.log("lockResult",lockResult);
//         if (lockResult > 0) {
//             const success = await checkAndUpdateStock(productId, quantity);
//             if (success) {
//                 console.log('庫存更新成功');
//             } else {
//                 console.log('庫存不足，無法更新');
//             }

//         }
//         return res.json({ success: true, message: '搶購成功' });
//     } else {
//         return res.status(400).json({ error: '庫存不足，搶購失敗' });
//     }
// }

module.exports = { Seckill };
