const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
  }

  handleConnection(ws, req) {
    // Extract token from query string
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      this.clients.set(decoded.userId, ws);

      ws.on('message', (message) => {
        this.handleMessage(decoded.userId, message);
      });

      ws.on('close', () => {
        this.clients.delete(decoded.userId);
      });

    } catch (error) {
      ws.close();
    }
  }

  handleMessage(userId, message) {
    // Handle incoming messages
    const data = JSON.parse(message);
    switch (data.type) {
      case 'unit_update':
        this.broadcastToUnit(data.unitId, data);
        break;
      case 'form_update':
        this.notifyFormUpdate(data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  broadcastToUnit(unitId, data) {
    // Broadcast to all members of a unit
    this.clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }

  notifyUser(userId, data) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  broadcastToRole(role, data) {
    // Broadcast to all users with specific role
    this.clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = WebSocketService;