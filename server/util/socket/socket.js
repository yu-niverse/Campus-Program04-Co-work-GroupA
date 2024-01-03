const { handleSendMessage } = require('./messages');
const { handleRepresentativeConnection, findUserOrWait } = require('./CSR');
const { handleUserConnection, findCSRorWait } = require('./client');

let waitingUsers = []; // Queue of waiting users
let availableRepresentatives = []; // List of available representatives

function handleConnection(socket) {
  // console.log("connected:", socket.id);
}

function handleDisconnect(socket, io) {
  socket.on('disconnect', () => {
    console.log("disconnected:", socket.id);
    availableRepresentatives = removeSocketId(availableRepresentatives, socket.id);
    waitingUsers = removeSocketId(waitingUsers, socket.id);

    // Check if the socket is a client or a representative
    if (socket.userId) {
      // It's a client
      handleClientDisconnect(socket.userId, io);
    } else if (socket.servedUserId) {
      console.log("handleCSRDisconnect")
      handleCSRDisconnect(socket.servedUserId, io);
    }
  });
}

function handleClientDisconnect(clientId, io) {
  const room = io.sockets.adapter.rooms.get(clientId);
  if (room) {
    // Iterate over the Set of sockets in the room
    for (let socketId of room) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(clientId);
        socket.servedUserId = null;
        console.log(`Representative ${socket.id} left room ${clientId}`);
        // You can also notify the representative here, if necessary
        socket.emit('client_disconnected', clientId);
        findUserOrWait(io, socket, waitingUsers, availableRepresentatives, socket.repId);        // This is a representative serving the client
      }
    }
  }
}

function handleCSRDisconnect(clientId, io) {
  console.log("CSR disconnected:", clientId);
  const room = io.sockets.adapter.rooms.get(clientId);
  if (room) {
    // Iterate over the Set of sockets in the room
    for (let socketId of room) {
      const socket = io.sockets.sockets.get(socketId);
      console.log("user socket in room: id ", socket.userId)
      if (socket.userId === clientId) {
        socket.leave(clientId);
        socket.isWaiting = true;
        findCSRorWait(io, socket, availableRepresentatives, waitingUsers);
      }
    }
  }
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

  // remove empty objects
  arr = arr.filter(obj => Object.keys(obj).length > 0);
  return arr;
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
