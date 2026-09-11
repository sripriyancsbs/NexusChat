import http from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import app from './app.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { initDb } from './config/db.js';
import { runMigrations } from './db/migrate.js';
import { seedDatabase } from './db/seed.js';
import { socketService } from './services/socketService.js';

const server = http.createServer(app);

// WebSocket Server initialization on same HTTP server
const wss = new WebSocketServer({ server });
socketService.initialize(wss);

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

// Start Server helper
export const startServer = (port = config.port) => {
  return new Promise((resolve) => {
    server.listen(port, async () => {
      try {
        await initDb();
        await runMigrations();
        await seedDatabase();
      } catch (err) {
        logger.error('Failed to initialize database on startup', { error: err.message });
      }

      logger.info(`NexusChat Server listening on port ${port} [${config.env}]`);
      logger.info(`REST API: http://localhost:${port}/api`);
      logger.info(`Health check: http://localhost:${port}/api/health`);
      logger.info(`WebSocket endpoint: ws://localhost:${port}`);
      resolve(server);
    });
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startServer();
}

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

// Process error safety handlers to prevent unexpected termination
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception captured:', { error: err.message, stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection captured:', { reason: reason instanceof Error ? reason.message : reason });
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export { server, wss };
