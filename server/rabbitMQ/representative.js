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

exports.handleRepresentativeConnection = handleRepresentativeConnection;
exports.pairRepWithNextWaitingCustomerOrAddToQueue = pairRepWithNextWaitingCustomerOrAddToQueue;