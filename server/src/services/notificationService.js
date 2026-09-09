import crypto from 'crypto';
import { query } from '../config/db.js';
import { socketService } from './socketService.js';
import { logger } from '../utils/logger.js';

/**
 * Creates and dispatches an authentic notification to a user.
 */
export const createNotification = async ({ userId, type, referenceId = null, metadata = {} }) => {
  try {
    const id = crypto.randomUUID();

    await query(`
      INSERT INTO notifications (id, user_id, type, reference_id, metadata, is_read)
      VALUES ($1, $2, $3, $4, $5, FALSE)
    `, [id, userId, type, referenceId, JSON.stringify(metadata)]);

    const notification = {
      id,
      userId,
      type,
      referenceId,
      metadata,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Real-time dispatch to user's active sockets
    socketService.broadcastToUser(userId, 'notification:new', { notification });

    return notification;
  } catch (err) {
    logger.error('Failed to create notification', { error: err.message, userId, type });
    return null;
  }
};
