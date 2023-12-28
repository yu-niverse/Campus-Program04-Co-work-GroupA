
const Message = require('../../server/models/message_model');
const { handleSendMessage } = require('./messages');

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

function handleUserConnection(socket, io) {
  socket.on('user_join', (user) => {
    const userId = user.id.toString();
    socket.userId = userId
    console.log("User connected:", user.name);
    if (availableRepresentatives.length > 0) {
      const repObj = availableRepresentatives.shift(); // Remove representative from the list
      const repId = Object.keys(repObj)[0].toString();
      const repSocketIds = repObj[repId];
      for (let repSocketId of repSocketIds) {
        const repSocket = io.sockets.sockets.get(repSocketId);
        repSocket.join(userId); // Representative joins the user's room
        socket.join(userId); // User joins their own room
      }
      console.log(`User ${user.name} assigned to representative ${repId}`);
      socket.to(userId).emit('assigned_user', { userId });
    } else {
      // No representatives available, add user to the waiting queue
      if (waitingUsers.find((userSocketObj) => userSocketObj[user.id])) {
        // User is already in the waiting queue
        waitingUsers.find((userSocketObj) => userSocketObj[user.id]).push(socket.id);
      } else {
        waitingUsers.push({ [user.id]: [socket.id] });
      }
      console.log("User added to the waiting queue:", user.name);
    }
  });
}


function handleRepresentativeConnection(socket, io) {
  socket.on('representative_join', (rep) => {
    console.log("Representative connected:", socket.id);
    if (waitingUsers.length > 0) {
      // Assign the first user in the queue to this representative
      const userSocketObj = waitingUsers.shift(); // Remove user from the queue
      const userId = Object.keys(userSocketObj)[0].toString();
      const userSocketIds = userSocketObj[userId];
      for (let userSocketId of userSocketIds) {
        const userSocket = io.sockets.sockets.get(userSocketId);
        userSocket.join(userId); // User joins their own room
        socket.join(userId); // Representative joins the user's room
        socket.servedUserId = userId;
      }
      console.log(`Representative ${socket.id} assigned to user ${userId}`);
      socket.emit('assigned_user', { userId });
    } else {
      // No representatives available, add user to the waiting queue
      if (availableRepresentatives.find((repSocketObj) => repSocketObj[rep.id])) {
        availableRepresentatives.find((repSocketObj) => repSocketObj[rep.id]).push(socket.id);
      } else {
        availableRepresentatives.push({ [rep.id]: [socket.id] });
      }
      console.log("Representative added to the available list:", socket.id);
    }
  });
}

function areSocketsInSameRoom(socketId1, socketId2, io) {
  const rooms1 = io.sockets.sockets.get(socketId1)?.rooms;
  const rooms2 = io.sockets.sockets.get(socketId2)?.rooms;

  if (!rooms1 || !rooms2) return false;

  for (let room of rooms1) {
    if (rooms2.has(room)) {
      console.log(`Both sockets are in the same room: ${room}`);
      return true;
    }
  }
  console.log('Sockets are not in the same room');
  return false;
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
    handleUserConnection(socket, io);
    handleRepresentativeConnection(socket, io);
    socket.on('send_message', (data) => handleSendMessage(socket, data));
  });
};
