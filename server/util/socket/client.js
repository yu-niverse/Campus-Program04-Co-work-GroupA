function handleUserConnection(socket, io, user, availableRepresentatives, waitingUsers) {
  const userId = user.id.toString();
  socket.userId = userId;
  socket.name = user.name;
  console.log("User connected:", user.name);
  socket.emit('user_connected', { userId });
  socket.isWaiting = true;
  findCSRorWait(io, socket, availableRepresentatives, waitingUsers);
}

function findCSRorWait(io, socket, availableRepresentatives, waitingUsers) {
  console.log(`User ${socket.userId} is finding representative now`)
  const repObj = getAvailableRepresentative(availableRepresentatives);
  if (repObj) {
    const repId = Object.keys(repObj)[0];
    console.log("find rep: ", repObj[repId])
    joinRepresentativeToUserRoom(repObj[repId], socket.userId, io, socket);
    socket.isWaiting = false;
    console.log(`User ${socket.userId} assigned to representative ${repId}`);
  } else {
    addUserToWaitingQueue(waitingUsers, socket.userId, socket.id);
    console.log("User added to the waiting queue:", socket.userId);
    console.log("waitingUsers", waitingUsers.length)
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
  console.log(`Add user ${userId} to waiting queue`)
  const userIndex = waitingUsers.findIndex(userObj => userObj[userId]);
  if (userIndex >= 0) {
    waitingUsers[userIndex][userId].push(socketId);
  } else {
    waitingUsers.push({ [userId]: [socketId] });
  }
}

exports.handleUserConnection = handleUserConnection;
exports.addUserToWaitingQueue = addUserToWaitingQueue;
exports.findCSRorWait = findCSRorWait;