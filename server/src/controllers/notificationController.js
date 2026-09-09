import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT id, type, reference_id, metadata, is_read, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    const notifications = result.rows.map(n => ({
      id: n.id,
      type: n.type,
      referenceId: n.reference_id,
      metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : (n.metadata || {}),
      read: n.is_read,
      isRead: n.is_read,
      createdAt: n.created_at
    }));

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    logger.error('List notifications error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve notifications.' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
    `, [id, userId]);

    return res.status(200).json({ success: true, id });
  } catch (err) {
    logger.error('Mark notification read error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to update notification.' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await query(`
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    logger.error('Mark all notifications read error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to mark notifications read.' });
  }
};
