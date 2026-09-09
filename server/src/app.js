import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Base API routes & Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'NexusChat Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'NexusChat API',
    description: 'Private conversations. Connected community.',
    version: '1.0.0'
  });
});

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
