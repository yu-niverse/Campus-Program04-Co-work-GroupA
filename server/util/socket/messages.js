const Message = require('../../server/models/message_model');

async function handleSendMessage(socket, data) {
  const { customer_id, message, time, sender_role } = data;
  await Message.createMessage({
    customer_id,
    message,
    time,
    sender_role,
  });
  socket.to(customer_id.toString()).emit('receive_message', data);
}

exports.handleSendMessage = handleSendMessage;