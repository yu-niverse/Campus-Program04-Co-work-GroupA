const { handleSendMessage } = require('./messages');
const { handleRepresentativeConnection } = require('./CSR');
const { handleUserConnection } = require('./client');

let waitingUsers = []; // Queue of waiting users
let availableRepresentatives = []; // List of available representatives

function handleConnection(socket) {
  // console.log("connected:", socket.id);
}

function handleDisconnect(socket, io) {
  socket.on('disconnect', () => {
    // Check if the socket is a client or a representative
    if (socket.userId) {
      // It's a client
      removeSocketId(waitingUsers, socket.id);
      handleClientDisconnect(socket.userId, io);
    } else if (socket.servedUserId) {
      removeSocketId(availableRepresentatives, socket.id);
      socket.to(userId).emit('representative_left', { userId });
    }
  });
}

function removeSocketId(arr, socketId) {
  arr.forEach(obj => {
    for (let userId in obj) {
      const index = obj[userId].indexOf(socketId);
      if (index > -1) {
        // Remove the socketId
        obj[userId].splice(index, 1);

        // If the array is empty, delete the userId key
        if (obj[userId].length === 0) {
          delete obj[userId];
        }
      }
    }
  });
}

function handleClientDisconnect(clientId, io) {
  const room = io.sockets.adapter.rooms.get(clientId);
  if (room) {
    // Iterate over the Set of sockets in the room
    for (let socketId of room) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.servedUserId === clientId) {
        // This is a representative serving the client
        socket.leave(clientId);
        socket.servedUserId = null;
        console.log(`Representative ${socket.id} left room ${clientId}`);
        // You can also notify the representative here, if necessary
        socket.emit('client_disconnected', { clientId });
      }
    }
  }
}


module.exports = function (io) {
  io.on('connection', (socket) => {
    handleConnection(socket);
    handleDisconnect(socket, io);
    socket.on('user_join', (data) => handleUserConnection(socket, io, data, availableRepresentatives, waitingUsers));
    socket.on('representative_join', (data) => handleRepresentativeConnection(socket, io, availableRepresentatives, waitingUsers, data));
    socket.on('send_message', (data) => handleSendMessage(socket, data));
  });
};
