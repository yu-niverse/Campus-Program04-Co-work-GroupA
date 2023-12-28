function handleUserConnection(socket, io) {
  socket.on('user_join', (user) => {
    const userId = user.id.toString();
    socket.userId = userId;
    console.log("User connected:", user.name);

    const repObj = getAvailableRepresentative();
    if (repObj) {
      const repId = Object.keys(repObj)[0];
      joinRepresentativeToUserRoom(repObj[repId], userId, io, socket);
      console.log(`User ${user.name} assigned to representative ${repId}`);
    } else {
      addUserToWaitingQueue(userId, socket.id);
      console.log("User added to the waiting queue:", user.name);
    }
  });
}

function handleRepresentativeConnection(socket, io) {
  socket.on('representative_join', (rep) => {
    console.log("Representative connected:", socket.id);

    const userObj = getWaitingUser();
    if (userObj) {
      const userId = Object.keys(userObj)[0];
      joinUserToRepresentativeRoom(userObj[userId], userId, socket);
      console.log(`Representative ${socket.id} assigned to user ${userId}`);
    } else {
      addRepresentativeToAvailableList(rep.id, socket.id);
      console.log("Representative added to the available list:", socket.id);
    }
  });
}

// Additional helper functions
function getAvailableRepresentative() {
  return availableRepresentatives.length > 0 ? availableRepresentatives.shift() : null;
}

function joinRepresentativeToUserRoom(repSocketIds, userId, io, userSocket) {
  repSocketIds.forEach(repSocketId => {
    const repSocket = io.sockets.sockets.get(repSocketId);
    repSocket?.join(userId);
    userSocket.join(userId);
  });
  userSocket.to(userId).emit('assigned_user', { userId });
}

function addUserToWaitingQueue(userId, socketId) {
  const userIndex = waitingUsers.findIndex(userObj => userObj[userId]);
  if (userIndex >= 0) {
    waitingUsers[userIndex][userId].push(socketId);
  } else {
    waitingUsers.push({ [userId]: [socketId] });
  }
}

function getWaitingUser() {
  return waitingUsers.length > 0 ? waitingUsers.shift() : null;
}

function joinUserToRepresentativeRoom(userSocketIds, userId, repSocket) {
  userSocketIds.forEach(userSocketId => {
    const userSocket = io.sockets.sockets.get(userSocketId);
    userSocket?.join(userId);
    repSocket.join(userId);
    repSocket.servedUserId = userId;
  });
  repSocket.emit('assigned_user', { userId });
}

function addRepresentativeToAvailableList(repId, socketId) {
  const repIndex = availableRepresentatives.findIndex(repObj => repObj[repId]);
  if (repIndex >= 0) {
    availableRepresentatives[repIndex][repId].push(socketId);
  } else {
    availableRepresentatives.push({ [repId]: [socketId] });
  }
}
