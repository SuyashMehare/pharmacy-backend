const clients = new Map(); // userId -> { res, timer }

// Heartbeat interval (keep connection alive)
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

function addClient(userId, res) {
  // Clear existing connection if any
  removeClient(userId);

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  
  // Send initial heartbeat
  res.write(':connected\n\n');

  // Setup heartbeat
  const heartbeatTimer = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, HEARTBEAT_INTERVAL);

  // Store client connection
  clients.set(userId.toString(), { res, timer: heartbeatTimer });

  // Handle client disconnect
  res.on('close', () => {
    removeClient(userId);
    console.log(`SSE connection closed for user ${userId}`);
  });
}

function removeClient(userId) {
  const clientKey = userId.toString();
  const client = clients.get(clientKey);
  
  if (client) {
    // Clear heartbeat timer
    clearInterval(client.timer);
    
    // End the response if possible
    if (!client.res.writableEnded) {
      client.res.end();
    }
    
    // Remove from map
    clients.delete(clientKey);
    console.log(`Removed SSE client for user ${userId}`);
  }
}

function sendEventToUser(userId, eventData) {
  const client = clients.get(userId.toString());
  if (client && !client.res.writableEnded) {
    try {
      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      return true;
    } catch (error) {
      console.error(`Error sending event to user ${userId}:`, error);
      removeClient(userId);
    }
  }
  return false;
}

function isUserOnline(userId) {
  return clients.has(userId.toString());
}

module.exports = {
  addClient,
  removeClient,
  sendEventToUser,
  isUserOnline
};