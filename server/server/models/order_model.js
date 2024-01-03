const { pool } = require('./mysqlcon');
const got = require('got');

const createOrder = async (order) => {
    const [result] = await pool.query('INSERT INTO order_table SET ?', order);
    return result.insertId;
};

const createPayment = async function (orderId, payment) {
    const conn = await pool.getConnection();
    try {
        await conn.query('START TRANSACTION');
        await conn.query('INSERT INTO payment SET ?', payment);
        await conn.query('UPDATE order_table SET status = ? WHERE id = ?', [0, orderId]);
        await conn.query('UPDATE seckill_variants SET stock = stock - 1 WHERE product_id = ?', ["202301051230"]);
        await conn.query('COMMIT');
        return true;
    } catch (error) {
        await conn.query('ROLLBACK');
        return { error };
    } finally {
        conn.release();
    }
};

const payOrderByPrime = async function (tappayKey, tappayId, prime, order) {
    let res = await got.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': tappayKey
        },
        json: {
            'prime': prime,
            'partner_key': tappayKey,
            'merchant_id': tappayId,
            'details': 'Stylish Payment',
            'amount': order.total,
            'cardholder': {
                'phone_number': order.recipient.phone,
                'name': order.recipient.name,
                'email': order.recipient.email
            },
            'remember': false
        },
        responseType: 'json'
    });
    return res.body;
};

const getUserPayments = async () => {
    const [orders] = await pool.query('SELECT user_id, total FROM order_table');
    return orders;
};

const getUserPaymentsGroupByDB = async () => {
    const [orders] = await pool.query('SELECT user_id, SUM(total) as total_payment FROM order_table GROUP BY user_id');
    return orders;
};

const setDeliveryDate = async (orderId, deliveryDate) => {
    const [orders] = await pool.query('UPDATE order_table SET delivery_date = ? WHERE id = ?', [deliveryDate, orderId]);
    return orders;
}


const getPendingOrders = async () => {
    const query = `
      SELECT o.*, u.line_notify_token 
      FROM order_table o
      JOIN user u ON o.user_id = u.id
      WHERE o.delivery_date < UNIX_TIMESTAMP(NOW(3)) * 1000 AND o.is_notification_sent = false
    `;
    const [orders] = await pool.execute(query);
    return orders;
}

const updateOrderNotificationStatus = async (connection, orderId) => {
    await connection.execute('UPDATE order_table SET is_notification_sent = true WHERE id = ?', [orderId]);
}

module.exports = {
    createOrder,
    createPayment,
    payOrderByPrime,
    getUserPayments,
    getUserPaymentsGroupByDB,
    setDeliveryDate,
    getPendingOrders,
    updateOrderNotificationStatus,
};