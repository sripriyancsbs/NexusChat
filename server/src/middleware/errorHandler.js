import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log the internal error safely
  logger.error(err.message, {
    method: req.method,
    path: req.originalUrl,
    statusCode
  });

  // Never expose raw database stack traces or secrets in client responses
  const response = {
    error: err.name || 'InternalServerError',
    message: err.isOperational ? err.message : 'An unexpected error occurred. Please try again later.'
  };

  if (!config.isProduction && err.stack && !err.isOperational) {
    response.debugStack = err.stack;
  }

  res.status(statusCode).json(response);
};
