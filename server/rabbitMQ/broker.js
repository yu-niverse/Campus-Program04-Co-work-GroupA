const amqp = require('amqplib');
const Message = require('../server/models/message_model');
const { handleUserConnection, pairUserWithNextAvailableRepOrAddToQueue } = require('./customer');
const { handleRepresentativeConnection, pairRepWithNextWaitingCustomerOrAddToQueue } = require('./representative');
const { RABBITMQ_HOST, RABBITMQ_PORT } = process.env;

async function startRabbitMQ() {
  const connection = await amqp.connect(`amqp://${RABBITMQ_HOST}:${RABBITMQ_PORT}`);
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
  // logger.info("connected:", socket.id);
}

function handleDisconnect(socket, io, channel) {
  socket.on('disconnect', () => {
    logger.info("disconnected:", socket.id, socket.userId, socket.repId);
    if (socket.userId) {
      handleClientDisconnect(socket, io, channel);
    } else if (socket.repId) {
      handleCSRDisconnect(socket, io, channel);
    }
  });
}


function handleClientDisconnect(userSocket, io, channel) {
  const userId = userSocket.userId;  // The room ID is the user's ID
  logger.info(`User ${userId} has disconnected`);

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
          logger.info(`Disconnected representative ${repSocket.id} from room ${userId}`);
          pairRepWithNextWaitingCustomerOrAddToQueue(repSocket, io, channel);
        }
      });
    }
  }
}


function handleCSRDisconnect(repSocket, io, channel) {
  const roomId = repSocket.servedUserId; // Assuming the room ID is stored in `repId`
  logger.info("CSR disconnected:", roomId);

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
    let userSocket;
    if (!otherRepPresent) {
      room.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.userId) {
          socket.emit('csr_disconnected', roomId);
          userSocket = socket;
          // Additional logic for re-queueing users can be added here
        }
      });
    }
    // pair once again
    pairUserWithNextAvailableRepOrAddToQueue(userSocket, io, channel);
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