const Message = require('../models/message_model');
const pageSize = 10;

const getMessages = async (req, res) => {
  const userId = req.user.id;
  const paging = parseInt(req.query.paging) || 0;
  const messages = await Message.getMessages(userId, paging, pageSize);


  const result = (productCount > (paging + 1) * pageSize) ? {
    data: productsWithDetail,
    next_paging: paging + 1
  } : {
    data: productsWithDetail,
  };


  res.status(200).send({ messages });
}


module.exports = {
  getMessages
}