function handleRepresentativeConnection(socket, io, availableRepresentatives, waitingUsers, rep) {
  console.log("Representative connected:", socket.id);
  const userObj = getWaitingUser(waitingUsers);
  if (userObj) {
    const userId = Object.keys(userObj)[0];
    joinUserToRepresentativeRoom(io, userObj[userId], userId, socket);
    console.log(`Representative ${socket.id} assigned to user ${userId}`);
  } else {
    addRepresentativeToAvailableList(availableRepresentatives, rep.id, socket.id);
    console.log("Representative added to the available list:", socket.id);
  }
}

function getWaitingUser(waitingUsers) {
  return waitingUsers.length > 0 ? waitingUsers.shift() : null;
}

function joinUserToRepresentativeRoom(io, userSocketIds, userId, repSocket) {
  userSocketIds.forEach(userSocketId => {
    const userSocket = io.sockets.sockets.get(userSocketId);
    userSocket?.join(userId);
    repSocket.join(userId);
    repSocket.servedUserId = userId;
  });
  repSocket.emit('assigned_user', { userId });
}

function addRepresentativeToAvailableList(availableRepresentatives, repId, socketId) {
  const repIndex = availableRepresentatives.findIndex(repObj => repObj[repId]);
  if (repIndex >= 0) {
    availableRepresentatives[repIndex][repId].push(socketId);
  } else {
    availableRepresentatives.push({ [repId]: [socketId] });
  }
}

exports.handleRepresentativeConnection = handleRepresentativeConnection;