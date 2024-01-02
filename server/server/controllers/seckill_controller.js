const { getSeckillProducts, getProductsVariants, buyProduct, syncPurchaseDataToDB, getProductInventory, updateStock } = require('../models/seckill_model');
const redis = require('../../util/cache');
const schedule = require('node-schedule');
const _ = require('lodash');
const util = require('../../util/util');

let isAppInitialized = false;

async function initializeApp(productId) {
    await getProductInventory(productId);
    const job = schedule.scheduleJob('*/5 * * * * *', async function () {
        await updateStock(productId);
        await syncPurchaseDataToDB();
    });
    isAppInitialized = true;
}

async function Seckill(req, res) {
    const { productId, userId } = req.params;
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
    try {
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
    } catch (error) {
        console.error({ error: error.message });
    }
}

const pageSize = 6;
const getProducts = async (req, res) => {
    const category = req.params.category;
    const paging = parseInt(req.query.paging) || 0;

    async function findProduct(category) {
        switch (category) {
            case 'all':
                return await getSeckillProducts(pageSize, paging);
            case 'men':
            case 'women':
            case 'accessories':
                return await getSeckillProducts(pageSize, paging, { category });
            case 'search': {
                const keyword = req.query.keyword;
                if (keyword) {
                    return await getSeckillProducts(pageSize, paging, { keyword });
                }
                break;
            }
            case 'hot': {
                return await getSeckillProducts(null, null, { category });
            }
            case 'details': {
                const id = parseInt(req.query.id);
                if (Number.isInteger(id)) {
                    return await getSeckillProducts(pageSize, paging, { id });
                }
            }
        }
        return Promise.resolve({});
    }

    const { products, productCount } = await findProduct(category);
    if (!products) {
        res.status(400).send({ error: 'Wrong Request' });
        return;
    }

    if (products.length == 0) {
        if (category === 'details') {
            res.status(200).json({ data: null });
        } else {
            res.status(200).json({ data: [] });
        }
        return;
    }

    let productsWithDetail = await getProductsWithDetail(req.protocol, req.hostname, products);

    if (category == 'details') {
        productsWithDetail = productsWithDetail[0];
    }

    const result =
        productCount > (paging + 1) * pageSize
            ? {
                  data: productsWithDetail,
                  next_paging: paging + 1,
              }
            : {
                  data: productsWithDetail,
              };

    res.status(200).json(result);
};

const getProductsWithDetail = async (protocol, hostname, products) => {
    const productIds = products.map((p) => p.id);
    const variants = await getProductsVariants(productIds);
    const variantsMap = _.groupBy(variants, (v) => v.product_id);
    return products.map((p) => {
        const imagePath = util.getImagePath(protocol, hostname, p.id);
        p.main_image = p.main_image ? imagePath + p.main_image : null;
        p.images = p.images ? p.images.split(',').map((img) => imagePath + img) : null;

        const productVariants = variantsMap[p.id];
        if (!productVariants) {
            return p;
        }

        p.variants = productVariants.map((v) => ({
            color_code: v.code,
            size: v.size,
            stock: v.stock,
        }));

        const allColors = productVariants.map((v) => ({
            code: v.code,
            name: v.name,
        }));
        p.colors = _.uniqBy(allColors, (c) => c.code);

        const allSizes = productVariants.map((v) => v.size);
        p.sizes = _.uniq(allSizes);
        return p;
    });
};

module.exports = {
    Seckill,
    getProducts,
    getProductsWithDetail,
};
