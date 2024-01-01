function handleRepresentativeConnection(rep, socket, io, channel) {
  socket.repId = rep.id;
  console.log("Rep connected:", rep.name, socket.id);

  // Emit to the rep that they are connected
  socket.emit('rep_connected', { repId: rep.id });

  // Check if there is any customer waiting
  pairRepWithNextWaitingCustomerOrAddToQueue(socket, io, channel);
}

async function pairRepWithNextWaitingCustomerOrAddToQueue(repSocket, io, channel) {
  try {
    const msg = await channel.get('waitingUsers', {});
    if (msg) {
      const customerDetails = JSON.parse(msg.content.toString());
      attemptToPairWithCustomer(repSocket, customerDetails, io, channel);
      channel.ack(msg);
    } else {
      addRepToAvailableQueue(channel, repSocket);
    }
  } catch (error) {
    console.error("Error in pairRepWithNextWaitingCustomerOrAddToQueue:", error);
    // Handle the error appropriately
  }
}

function attemptToPairWithCustomer(repSocket, customerDetails, io, channel) {
  const { userId: customerId, socketId: customerSocketId } = customerDetails;
  const customerSocket = io.sockets.sockets.get(customerSocketId);

  if (customerSocket) {
    customerSocket.join(customerId);
    customerSocket.isWaiting = false;

    repSocket.join(customerId);
    repSocket.servedUserId = customerId;
    repSocket.emit('assigned_user', { userId: customerId });

    console.log(`Pairing rep ${repSocket.repId} ${repSocket.id} with customer ${customerId}`);
  } else {
    console.log(`Customer ${customerId} is no longer connected. Checking for next waiting customer.`);
    pairRepWithNextWaitingCustomerOrAddToQueue(repSocket, io, channel);
  }
}

function addRepToAvailableQueue(channel, repSocket) {
  const repConnectionDetails = {
    repId: repSocket.repId,
    socketId: repSocket.id,
  };
  channel.sendToQueue('availableRepresentatives', Buffer.from(JSON.stringify(repConnectionDetails)));
  console.log(`Representative ${repSocket.repId} added to available queue`);
}

function findUserOrWait(io, socket, waitingUsers, availableRepresentatives, repId) {
  console.log(`repId ${repId} is finding user now`)
  const userObj = getWaitingUser(waitingUsers);
  if (userObj) {
    const userId = Object.keys(userObj)[0];
    joinUserToRepresentativeRoom(io, userObj[userId], userId, socket);
    console.log(`Representative ${socket.id} assigned to user ${userId}`);
  } else {
    addRepresentativeToAvailableList(availableRepresentatives, repId, socket.id);
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
  const availableRepresentativesIds = availableRepresentatives.map(repObj => Object.keys(repObj)[0]);
  console.log("availableRepresentativesIds", availableRepresentativesIds)
}

exports.handleRepresentativeConnection = handleRepresentativeConnection;
exports.addRepToAvailableQueue = addRepToAvailableQueue;
exports.findUserOrWait = findUserOrWait;