const amqp = require('amqplib');
const Message = require('../server/models/message_model');
const { handleUserConnection, addUserToWaitingQueue } = require('./customer');
const { handleRepresentativeConnection, addRepToAvailableQueue } = require('./representative');

async function startRabbitMQ() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  // Declare queues
  await channel.assertQueue('waitingUsers');
  await channel.assertQueue('availableRepresentatives');

  return { connection, channel };
}

module.exports = async function (io) {
  const { channel } = await startRabbitMQ();

  io.on('connection', (socket) => {
    handleConnection(socket);
    handleDisconnect(socket, io, channel); // Pass channel to handle disconnects
    socket.on('user_join', (data) => handleUserConnection(data, socket, io, channel));
    socket.on('representative_join', (data) => handleRepresentativeConnection(data, socket, io, channel));
    socket.on('send_message', (data) => handleSendMessage(socket, data));
  });
};

function handleConnection(socket) {
  // console.log("connected:", socket.id);
}

function handleDisconnect(socket, io, channel) {
  socket.on('disconnect', () => {
    console.log("disconnected:", socket.id, socket.userId, socket.repId);
    if (socket.userId) {
      handleClientDisconnect(socket, io, channel);
    } else if (socket.repId) {
      handleCSRDisconnect(socket, io, channel);
    }
  });
}


function handleClientDisconnect(userSocket, io, channel) {
  const userId = userSocket.userId;  // The room ID is the user's ID
  userSocket.leave(userId);
  console.log(`User ${userId} has disconnected and left the room ${userId}`);

  // Check the remaining members in the room
  const room = io.sockets.adapter.rooms.get(userId);

  if (room && room.size > 0) {
    let onlyRepsLeft = true;

    // Check if only representatives are left in the room
    room.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && !socket.repId) {
        // If any socket does not have a repId, then it's not a representative
        onlyRepsLeft = false;
      }
    });

    // If only representatives are left, disconnect them
    if (onlyRepsLeft) {
      room.forEach(socketId => {
        const repSocket = io.sockets.sockets.get(socketId);
        if (repSocket) {
          repSocket.leave(userId);
          repSocket.emit('client_disconnected', userId);
          console.log(`Disconnected representative ${repSocket.id} from room ${userId}`);
          addRepToAvailableQueue(channel, repSocket);
        }
      });
    }
  }
}


function handleCSRDisconnect(repSocket, io, channel) {
  const roomId = repSocket.servedUserId; // Assuming the room ID is stored in `repId`
  console.log("CSR disconnected:", roomId);

  const room = io.sockets.adapter.rooms.get(roomId);
  if (room) {
    // Check if any other representatives are still in the room
    let otherRepPresent = false;
    room.forEach(socketId => {
      const socket = io.sockets.sockets.get(socketId);
      if (socket && socket.repId && socket.id !== repSocket.id) {
        otherRepPresent = true;
      }
    });

    // If no other representatives are present, remove the users from the room
    if (!otherRepPresent) {
      room.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.userId) {
          socket.leave(roomId);
          console.log(`User ${socket.userId} left room ${roomId} due to CSR disconnection`);
          socket.emit('csr_disconnected', roomId);
          // Additional logic for re-queueing users can be added here
        }
      });
    }
  }
}


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