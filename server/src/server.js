import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { initDb } from './config/db.js';
import { runMigrations } from './db/migrate.js';
import { seedDatabase } from './db/seed.js';

const server = http.createServer(app);

// WebSocket Server initialization on same HTTP server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  logger.info('Incoming WebSocket connection initiated', {
    url: req.url,
    ip: req.socket.remoteAddress
  });

  // Base Phase 1 ping/pong heartbeat
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch {
      // Ignore unparseable raw pings in Phase 1
    }
  });

  ws.on('close', () => {
    logger.debug('WebSocket client disconnected');
  });
});

// Heartbeat interval to prune dead connections
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
heartbeatInterval.unref();

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// Start Server
server.listen(config.port, async () => {
  try {
    await initDb();
    await runMigrations();
    await seedDatabase();
  } catch (err) {
    logger.error('Failed to initialize database on startup', { error: err.message });
  }

  logger.info(`NexusChat Server listening on port ${config.port} [${config.env}]`);
  logger.info(`REST API: http://localhost:${config.port}/api`);
  logger.info(`Health check: http://localhost:${config.port}/api/health`);
  logger.info(`WebSocket endpoint: ws://localhost:${config.port}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  clearInterval(heartbeatInterval);
  wss.close(() => {
    server.close(() => {
      logger.info('HTTP and WebSocket servers closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server, wss };
