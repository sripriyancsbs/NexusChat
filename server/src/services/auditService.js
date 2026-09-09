import crypto from 'crypto';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Record an administrative/security audit event.
 * Enforces privacy boundary: Never records message bodies or credentials.
 */
export const recordAudit = async ({ adminId = null, action, targetUserId = null, metadata = {} }) => {
  try {
    const id = crypto.randomUUID();
    
    // Explicit sanitization: ensure no message bodies, passwords, or secrets are ever recorded
    const sanitizedMeta = { ...metadata };
    delete sanitizedMeta.password;
    delete sanitizedMeta.token;
    delete sanitizedMeta.content;
    delete sanitizedMeta.message;
    delete sanitizedMeta.messageBody;

    await query(`
      INSERT INTO audit_logs (id, admin_id, action, target_user_id, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, adminId, action, targetUserId, JSON.stringify(sanitizedMeta)]);

    logger.info(`Audit log recorded: [${action}]`, { adminId, targetUserId });
    return id;
  } catch (err) {
    logger.error('Failed to record audit log', { error: err.message, action });
    return null;
  }
};
