/**
 * Real-time WebSocket Client for NexusChat
 */

class SocketClient {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 2000;
    this.isConnected = false;
    this.currentSubscriptions = new Set();
  }

  connect(token) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.trigger('connected');

        // Authenticate with token
        if (token) {
          this.send('auth', { token });
        }

        // Resubscribe to previous rooms
        for (const roomId of this.currentSubscriptions) {
          this.send('subscribe', { conversationId: roomId });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.trigger(payload.type, payload);
          this.trigger('*', payload);
        } catch {
          // Ignore parse errors
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.trigger('disconnected');
        this.scheduleReconnect(token);
      };

      this.ws.onerror = (err) => {
        this.trigger('error', err);
      };
    } catch (err) {
      this.scheduleReconnect(token);
    }
  }

  scheduleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const timeout = Math.min(this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts), 15000);
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect(token);
        }
      }, timeout);
    }
  }

  subscribe(conversationId) {
    if (!conversationId) return;
    this.currentSubscriptions.add(conversationId);
    if (this.isConnected) {
      this.send('subscribe', { conversationId });
    }
  }

  unsubscribe(conversationId) {
    this.currentSubscriptions.delete(conversationId);
    if (this.isConnected) {
      this.send('unsubscribe', { conversationId });
    }
  }

  setTyping(conversationId, isTyping) {
    if (this.isConnected) {
      this.send(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
    }
  }

  ackRead(conversationId) {
    if (this.isConnected) {
      this.send('read:ack', { conversationId });
    }
  }

  setPresence(status) {
    if (this.isConnected) {
      this.send('presence:set', { status });
    }
  }

  send(type, data = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  trigger(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      }
    }
  }

  disconnect() {
    this.currentSubscriptions.clear();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const socketClient = new SocketClient();
export default socketClient;
