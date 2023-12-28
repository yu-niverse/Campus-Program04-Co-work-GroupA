
const Message = require('../server/models/message_model');

function handleConnection(socket) {
  console.log("User connected:", socket.id);
  socket.emit('connection', 'hello world');
}

function handleDisconnect(socket) {
  socket.on('disconnect', () => {
    console.log("User disconnected:", socket.id);
  });
}

function handleJoinRoom(socket) {
  socket.on('join_room', (data) => {
    const { user } = data
    console.log(user.name + ' joined the room');
    socket.join(user.id);
  });
}

function handleSendMessage(socket) {
  socket.on('send_message', async (data) => {
    const { customer_id, message, time, sender_role } = data;
    await Message.createMessage({
      customer_id,
      message,
      time,
      sender_role,
    });
    console.log(`id: ${socket.id}: ` + customer_id + ' sent a message: ' + message);
    socket.to(customer_id).emit('receive_message', data);
  });
}

module.exports = function (io) {
  io.on('connection', (socket) => {
    handleConnection(socket);
    handleDisconnect(socket);
    handleJoinRoom(socket);
    handleSendMessage(socket);
  });
};
