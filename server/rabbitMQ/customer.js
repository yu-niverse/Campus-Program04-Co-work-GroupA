function handleUserConnection(user, socket, io, channel) {
  const userId = user.id.toString();
  socket.userId = userId;
  socket.name = user.name;
  console.log(`User connected: ${userId}`, socket.name, " ", socket.id);

  // Emit to the user that they are connected
  socket.emit('user_connected', { userId });

  // Mark the user as waiting
  socket.isWaiting = true;

  // Try to pair the user with an available representative
  pairUserWithNextAvailableRepOrAddToQueue(socket, io, channel);
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

    console.log(`Pairing user ${userSocket.userId} with rep ${repSocket.id} ${repSocket.repId}`);
  } else {
    console.log(`Representative ${repDetails.repId} is no longer available. Checking for next available rep.`);
    pairUserWithNextAvailableRepOrAddToQueue(userSocket, io, channel);
  }
}

function addUserToWaitingQueue(channel, userSocket) {
  const userConnectionDetails = {
    userId: userSocket.userId,
    socketId: userSocket.id,
  };
  channel.sendToQueue('waitingUsers', Buffer.from(JSON.stringify(userConnectionDetails)));
  console.log(`User ${userSocket.userId} added to waiting queue`);
}


exports.handleUserConnection = handleUserConnection;
exports.addUserToWaitingQueue = addUserToWaitingQueue;