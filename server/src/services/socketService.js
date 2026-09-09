import { WebSocket } from 'ws';
import { query } from '../config/db.js';
import { hashToken } from '../middleware/auth.js';
import { checkConversationAccess } from '../controllers/messageController.js';
import { logger } from '../utils/logger.js';

class SocketService {
  constructor() {
    this.wss = null;
    this.userSockets = new Map(); // userId -> Set<WebSocket>
    this.roomSockets = new Map(); // conversationId -> Set<WebSocket>
    this.userPresence = new Map(); // userId -> 'online' | 'away' | 'offline'
  }

  initialize(wss) {
    this.wss = wss;

    wss.on('connection', (ws, req) => {
      ws.isAlive = true;
      ws.userId = null;
      ws.subscribedRooms = new Set();

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle query token if present: /?token=...
      try {
        const url = new URL(req.url, 'http://localhost');
        const token = url.searchParams.get('token');
        if (token) {
          this.authenticateSocket(ws, token);
        }
      } catch {
        // Fallback to in-message authentication
      }

      ws.on('message', async (rawData) => {
        try {
          const payload = JSON.parse(rawData.toString());
          await this.handleMessage(ws, payload);
        } catch (err) {
          logger.debug('WebSocket parse/handler error', { error: err.message });
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });
    });

    logger.info('WebSocket Service initialized with strict room authorization.');
  }

  async authenticateSocket(ws, token) {
    try {
      const tokenHash = hashToken(token);
      const res = await query(`
        SELECT 
          s.id AS session_id,
          s.expires_at,
          s.revoked_at,
          u.id, 
          u.username, 
          u.display_name, 
          u.role, 
          u.status
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = $1
      `, [tokenHash]);

      if (res.rows.length === 0) {
        ws.send(JSON.stringify({ type: 'auth:error', message: 'Invalid session token.' }));
        return false;
      }

      const session = res.rows[0];
      if (session.revoked_at || new Date(session.expires_at) < new Date() || session.status !== 'ACTIVE') {
        ws.send(JSON.stringify({ type: 'auth:error', message: 'Session expired, revoked, or account inactive.' }));
        return false;
      }

      ws.userId = session.id;
      ws.username = session.username;

      if (!this.userSockets.has(session.id)) {
        this.userSockets.set(session.id, new Set());
      }
      this.userSockets.get(session.id).add(ws);
      this.userPresence.set(session.id, 'online');

      ws.send(JSON.stringify({
        type: 'auth:success',
        user: { id: session.id, username: session.username, role: session.role }
      }));

      // Broadcast presence update
      this.broadcastGlobalPresence(session.id, 'online');
      return true;
    } catch (err) {
      logger.error('Socket authentication error', { error: err.message });
      return false;
    }
  }

  async handleMessage(ws, payload) {
    const { type, ...data } = payload;

    if (type === 'auth') {
      return this.authenticateSocket(ws, data.token);
    }

    // All other operations require authenticated socket
    if (!ws.userId) {
      return ws.send(JSON.stringify({ type: 'error', message: 'Authentication required.' }));
    }

    switch (type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      case 'subscribe':
        await this.handleSubscribe(ws, data.conversationId);
        break;

      case 'unsubscribe':
        this.handleUnsubscribe(ws, data.conversationId);
        break;

      case 'typing:start':
        this.handleTyping(ws, data.conversationId, true);
        break;

      case 'typing:stop':
        this.handleTyping(ws, data.conversationId, false);
        break;

      case 'presence:set':
        if (['online', 'away'].includes(data.status)) {
          this.userPresence.set(ws.userId, data.status);
          this.broadcastGlobalPresence(ws.userId, data.status);
        }
        break;

      case 'read:ack':
        await this.handleReadAck(ws, data.conversationId);
        break;
    }
  }

  async handleSubscribe(ws, conversationId) {
    if (!conversationId) return;

    // Strict privacy boundary: Verify user is a member of this conversation
    const isAuthorized = await checkConversationAccess(conversationId, ws.userId);
    if (!isAuthorized) {
      return ws.send(JSON.stringify({
        type: 'error',
        error: 'Forbidden',
        message: 'Unauthorized conversation subscription.'
      }));
    }

    if (!this.roomSockets.has(conversationId)) {
      this.roomSockets.set(conversationId, new Set());
    }
    this.roomSockets.get(conversationId).add(ws);
    ws.subscribedRooms.add(conversationId);

    ws.send(JSON.stringify({ type: 'subscribed', conversationId }));
  }

  handleUnsubscribe(ws, conversationId) {
    if (this.roomSockets.has(conversationId)) {
      this.roomSockets.get(conversationId).delete(ws);
    }
    ws.subscribedRooms.delete(conversationId);
  }

  handleTyping(ws, conversationId, isTyping) {
    if (!ws.subscribedRooms.has(conversationId)) return;

    // Broadcast typing event strictly to other members in the room (not to sender)
    this.broadcastToConversation(conversationId, 'typing:update', {
      conversationId,
      userId: ws.userId,
      username: ws.username,
      isTyping
    }, ws);
  }

  async handleReadAck(ws, conversationId) {
    if (!ws.subscribedRooms.has(conversationId)) return;

    await query(`
      UPDATE conversation_members
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, ws.userId]);

    this.broadcastToConversation(conversationId, 'read:update', {
      conversationId,
      userId: ws.userId,
      readAt: new Date().toISOString()
    });
  }

  handleDisconnect(ws) {
    if (ws.userId && this.userSockets.has(ws.userId)) {
      const sockets = this.userSockets.get(ws.userId);
      sockets.delete(ws);

      if (sockets.size === 0) {
        this.userSockets.delete(ws.userId);
        this.userPresence.set(ws.userId, 'offline');
        this.broadcastGlobalPresence(ws.userId, 'offline');
      }
    }

    // Clean up room subscriptions
    for (const roomId of ws.subscribedRooms) {
      if (this.roomSockets.has(roomId)) {
        this.roomSockets.get(roomId).delete(ws);
      }
    }
  }

  /**
   * Broadcast an event strictly to sockets registered in a specific conversation room.
   */
  broadcastToConversation(conversationId, event, data, excludeWs = null) {
    const sockets = this.roomSockets.get(conversationId);
    if (!sockets) return;

    const message = JSON.stringify({ type: event, ...data });
    for (const client of sockets) {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  /**
   * Send an event directly to all active sockets of a specific user.
   */
  broadcastToUser(userId, event, data) {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    const message = JSON.stringify({ type: event, ...data });
    for (const client of sockets) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  broadcastGlobalPresence(userId, status) {
    const message = JSON.stringify({
      type: 'presence:update',
      userId,
      status,
      timestamp: Date.now()
    });

    if (!this.wss) return;
    for (const client of this.wss.clients) {
      if (client.readyState === WebSocket.OPEN && client.userId) {
        client.send(message);
      }
    }
  }

  getPresence(userId) {
    return this.userPresence.get(userId) || 'offline';
  }
}

export const socketService = new SocketService();
export default socketService;
