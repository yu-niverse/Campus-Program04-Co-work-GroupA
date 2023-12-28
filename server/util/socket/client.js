function handleUserConnection(socket, io, user, availableRepresentatives, waitingUsers) {
  const userId = user.id.toString();
  socket.userId = userId;
  console.log("User connected:", user.name);

  const repObj = getAvailableRepresentative(availableRepresentatives);
  if (repObj) {
    const repId = Object.keys(repObj)[0];
    joinRepresentativeToUserRoom(repObj[repId], userId, io, socket);
    console.log(`User ${user.name} assigned to representative ${repId}`);
  } else {
    addUserToWaitingQueue(waitingUsers, userId, socket.id);
    console.log("User added to the waiting queue:", user.name);
  }
}

function getAvailableRepresentative(availableCSRs) {
  return availableCSRs.length > 0 ? availableCSRs.shift() : null;
}


function joinRepresentativeToUserRoom(repSocketIds, userId, io, userSocket) {
  repSocketIds.forEach(repSocketId => {
    const repSocket = io.sockets.sockets.get(repSocketId);
    repSocket?.join(userId);
  });
  userSocket.join(userId);
  userSocket.to(userId).emit('assigned_user', { userId });
}

function addUserToWaitingQueue(waitingUsers, userId, socketId) {
  const userIndex = waitingUsers.findIndex(userObj => userObj[userId]);
  if (userIndex >= 0) {
    waitingUsers[userIndex][userId].push(socketId);
  } else {
    waitingUsers.push({ [userId]: [socketId] });
  }
}

exports.handleUserConnection = handleUserConnection;