const Message = require('../models/message_model');
const pageSize = 10;

const getMessages = async (req, res) => {
  const userId = req.user.id;
  const paging = parseInt(req.query.paging) || 0;
  const { messages, messagesCount } = await Message.getMessages(userId, paging, pageSize);
  const result =
    messagesCount < pageSize
      ? {
          messages: messages,
        }
      : {
          messages: messages,
          next_paging: paging + 1,
        };

  res.status(200).send(result);
};

const getCustomerMessages = async (req, res) => {
  const { customerId } = req.query;
  const paging = parseInt(req.query.paging) || 0;
  const { messages, messagesCount } = await Message.getMessages(customerId, paging, pageSize);
  const result =
    messagesCount < pageSize
      ? {
          messages: messages,
        }
      : {
          messages: messages,
          next_paging: paging + 1,
        };

  res.status(200).send(result);
};

module.exports = {
  getMessages,
  getCustomerMessages,
};
