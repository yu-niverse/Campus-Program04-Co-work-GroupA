const { pool } = require('./mysqlcon');
const User = require('./user_model');
const { logger } = require('../../util/logger');

const addNotifyProduct = async (email, productId) => {
  // start transaction
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('START TRANSACTION');
    // get userId from email
    const user = await User.getUserDetail(email);
    const userId = user.id;
    // check if already exist
    const [rows] = await connection.query('SELECT * FROM user_product_notify WHERE userId = ? AND productId = ?', [userId, productId]);
    if (rows.length > 0) {
      return -1;
    } else {
      const sql = 'INSERT INTO user_product_notify (userId, productId) VALUES (?, ?)';
      const [rows] = await connection.query(sql, [userId, productId]);
      await connection.query('COMMIT');
      logger.info(`Added notify product ${productId} for user ${userId}`);
      return rows.affectedRows;
    }
  } catch (error) {
    console.error('Error addNotifyProduct:', error);
    await connection.query('ROLLBACK');
    return false;
  } finally {
    connection.release();
  }
}


async function getNotifyProductandUser() {
  const queryStr = `
  SELECT s.*, u.id AS userId, u.email, u.name, u.line_notify_token
  FROM seckill_products s
  JOIN user_product_notify upn ON s.id = upn.productId
  JOIN user u ON upn.userId = u.id
  WHERE s.start_time >= NOW()
  AND s.start_time <= NOW() + INTERVAL 2 DAY
  AND s.end_time > NOW()
  ORDER BY s.id DESC;  
  `;
  const [result] = await pool.query(queryStr);
  return result;
}


const removeNotifyProduct = async (userId, productId) => {
  const sql = 'DELETE FROM user_product_notify WHERE userId = ? AND productId = ?';
  const [rows] = await pool.query(sql, [userId, productId]);
  return rows.affectedRows;
}

module.exports = {
  addNotifyProduct,
  getNotifyProductandUser,
  removeNotifyProduct
}


