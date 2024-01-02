require('dotenv').config();
const validator = require('validator');
const { TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID } = process.env;
const Order = require('../models/order_model');
const { pool } = require('../models/mysqlcon');
const { sendLineNotification, generateDeliverMessage } = require('../../util/lineNotification');

const checkout = async (req, res) => {
    const data = req.body;
    if (!data.order || !data.order.total || !data.order.list || !data.prime) {
        res.status(400).send({ error: 'Create Order Error: Wrong Data Format' });
        return;
    }
    const user = req.user;
    const now = new Date();
    const number = '' + now.getMonth() + now.getDate() + (now.getTime() % (24 * 60 * 60 * 1000)) + Math.floor(Math.random() * 10);
    const orderRecord = {
        number: number,
        time: now.getTime(),
        status: -1, // -1 for init (not pay yet)
        total: data.order.total,
        details: validator.blacklist(JSON.stringify(data.order), '<>')
    };
    orderRecord.user_id = (user && user.id) ? user.id : null;
    const orderId = await Order.createOrder(orderRecord);
    let paymentResult;
    try {
        paymentResult = await Order.payOrderByPrime(TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID, data.prime, data.order);
        if (paymentResult.status != 0) {
            res.status(400).send({ error: 'Invalid prime' });
            return;
        }
    } catch (error) {
        res.status(400).send({ error });
        return;
    }
    const payment = {
        order_id: orderId,
        details: validator.blacklist(JSON.stringify(paymentResult), '<>')
    };
    await Order.createPayment(orderId, payment);


    // for testing purpose, set delivery date to 2 minutes later
    const deliveryDate = new Date();
    deliveryDate.setMinutes(deliveryDate.getMinutes() + 1);

    console.log("timetime", deliveryDate.getTime());
    await Order.setDeliveryDate(orderId, deliveryDate.getTime());

    res.send({ data: { number } });
};

// For Load Testing
const getUserPayments = async (req, res) => {
    const orders = await Order.getUserPayments();
    const userPayments = orders.reduce((obj, order) => {
        let userId = order.user_id;
        if (!(userId in obj)) {
            obj[userId] = 0;
        }
        obj[userId] += order.total;
        return obj;
    }, {});
    const userPaymentsData = Object.keys(userPayments).map(userId => {
        return {
            userId: parseInt(userId),
            totalPayment: userPayments[userId]
        };
    });
    res.status(200).send({ data: userPaymentsData });
};

const getUserPaymentsGroupByDB = async (req, res) => {
    const orders = await Order.getUserPaymentsGroupByDB();
    res.status(200).send({ data: orders });
};


const processPendingOrders = async () => {
    try {
        const orders = await Order.getPendingOrders();
        if (orders.length === 0) {
            return;
        }

        const notificationPromises = orders.map(async (order) => {
            if (!order.line_notify_token) {
                console.error('No line_notify_token found for order ID:', order.id);
                return Order.updateOrderNotificationStatus(pool, order.id);
            }

            if (typeof order.details === 'string') {
                order.details = JSON.parse(order.details);
            }
            return sendNotificationAndUpdate(order);
        });

        await Promise.allSettled(notificationPromises);
    } catch (e) {
        console.error('Error processing orders:', e);
    }
}

const sendNotificationAndUpdate = async (order) => {
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        const message = await generateDeliverMessage(order);
        console.log('order_id:', order.id, 'sent');
        await sendLineNotification(order.line_notify_token, null, message);
        await Order.updateOrderNotificationStatus(connection, order.id);
        await connection.commit();
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Error processing order ID:', order.id, error);
        throw error;
    } finally {
        if (connection) {
            await connection.release();
        }
    }
}


module.exports = {
    checkout,
    getUserPayments,
    getUserPaymentsGroupByDB,
    processPendingOrders,
};