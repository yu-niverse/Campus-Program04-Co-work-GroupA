const { logger } = require('../util/logger');

function handleUserConnection(user, socket, io, channel) {
  const userId = user.id.toString();
  socket.userId = userId;
  socket.name = user.name;
  logger.info(`User connected: ${userId}`, socket.name, " ", socket.id);

  // Emit to the user that they are connected
  socket.emit('user_connected', { userId });

  // Mark the user as waiting
  socket.isWaiting = true;

  const isJoined = joinUserRoom(socket, userId, io);
  // Try to pair the user with an available representative
  if (!isJoined) {
    pairUserWithNextAvailableRepOrAddToQueue(socket, io, channel);
  }
}

function joinUserRoom(socket, userId, io) {
  const room = io.sockets.adapter.rooms.get(userId);
  if (room) {
    // If the room with the name of userId exists, join the room
    socket.join(userId);
    return true;
  }
  return false;
}


async function pairUserWithNextAvailableRepOrAddToQueue(userSocket, io, channel) {
  try {
    const msg = await channel.get('availableRepresentatives', {});
    if (msg) {
      const repDetails = JSON.parse(msg.content.toString());
      attemptToPairWithRep(userSocket, repDetails, io, channel);
      channel.ack(msg);
    } else {
      addUserToWaitingQueue(channel, userSocket);
    }
  } catch (error) {
    console.error("Error in pairUserWithNextAvailableRepOrAddToQueue:", error);
    // Handle the error appropriately
  }
}

function attemptToPairWithRep(userSocket, repDetails, io, channel) {
  const repSocket = io.sockets.sockets.get(repDetails.socketId);

  if (repSocket) {
    const roomId = userSocket.userId;
    userSocket.join(roomId);
    repSocket.join(roomId);

    userSocket.isWaiting = false;
    repSocket.servedUserId = userSocket.userId;
    io.in(roomId).emit('assigned_user', { userId: userSocket.userId });

    logger.info(`Pairing user ${userSocket.userId} with rep ${repSocket.id} ${repSocket.repId}`);
  } else {
    logger.info(`Representative ${repDetails.repId} is no longer available. Checking for next available rep.`);
    pairUserWithNextAvailableRepOrAddToQueue(userSocket, io, channel);
  }
}

function addUserToWaitingQueue(channel, userSocket) {
  const userConnectionDetails = {
    userId: userSocket.userId,
    socketId: userSocket.id,
  };
  channel.sendToQueue('waitingUsers', Buffer.from(JSON.stringify(userConnectionDetails)));
  logger.info(`User ${userSocket.userId} added to waiting queue`);
}


exports.handleUserConnection = handleUserConnection;
exports.pairUserWithNextAvailableRepOrAddToQueue = pairUserWithNextAvailableRepOrAddToQueue;