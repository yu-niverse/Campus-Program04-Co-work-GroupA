const { pool } = require('./mysqlcon');


/*
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,  // Match the type and attributes of 'id' in the user table
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message TEXT NOT NULL,
    sender_role ENUM('customer', 'representative') NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES user(id)
);
*/

const createMessage = async (message) => {
  const { customerId, messageText, senderRole, time } = message;
  console.log("t", time);
  const [result] = await pool.query('INSERT INTO messages (customer_id, message, sender_role, time) VALUES (?, ?, ?, ?)',
    [customerId, messageText, senderRole, time]);
  return result.insertId;
}

const getMessages = async (userId, paging, pageSize) => {
  const messageQuery = 'SELECT * FROM messages WHERE customer_id = ? ORDER BY time DESC LIMIT ?, ?';

  const [messages] = await pool.query(messageQuery,
    [userId, pageSize * paging, pageSize]);
  return messages;
}


module.exports = {
  createMessage,
  getMessages
}