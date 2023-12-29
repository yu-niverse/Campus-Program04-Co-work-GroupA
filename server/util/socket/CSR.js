function handleRepresentativeConnection(socket, io, availableRepresentatives, waitingUsers, rep) {
  console.log("Representative connected:", socket.id);
  socket.repId = rep.id;
  const userObj = getWaitingUser(waitingUsers);
  if (userObj) {
    const userId = Object.keys(userObj)[0];
    joinUserToRepresentativeRoom(io, userObj[userId], userId, socket);
    console.log(`Representative ${socket.id} assigned to user ${userId}`);
  } else {
    addRepresentativeToAvailableList(availableRepresentatives, rep.id, socket.id);
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
  console.log("Representative added to the available list:", repId);
  console.log("availableRepresentatives", availableRepresentatives.length)
  for (let userObj of availableRepresentatives) {
    console.log("availableRepresentatives", Object.keys(userObj))
  }
}

exports.handleRepresentativeConnection = handleRepresentativeConnection;
exports.addRepresentativeToAvailableList = addRepresentativeToAvailableList;