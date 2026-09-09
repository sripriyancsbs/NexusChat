import crypto from 'crypto';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Authentication middleware.
 * Verifies active session token and checks account status.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    let token = null;

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-session-token']) {
      token = req.headers['x-session-token'].trim();
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. No session token provided.'
      });
    }

    const tokenHash = hashToken(token);

    // Query active session and user
    const sessionResult = await query(`
      SELECT 
        s.id AS session_id,
        s.user_id,
        s.expires_at,
        s.revoked_at,
        u.id,
        u.username,
        u.email,
        u.display_name,
        u.avatar_url,
        u.bio,
        u.role,
        u.status
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = $1
    `, [tokenHash]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid session token.'
      });
    }

    const session = sessionResult.rows[0];

    // Check if session has been revoked
    if (session.revoked_at) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session has been revoked.'
      });
    }

    // Check if session has expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Session has expired. Please log in again.'
      });
    }

    // Enforce account status: ACTIVE required for platform operations
    if (session.status !== 'ACTIVE') {
      let msg = 'Account is not active.';
      if (session.status === 'PENDING') msg = 'Your account request is currently pending admin approval.';
      if (session.status === 'SUSPENDED') msg = 'Your account has been suspended by an administrator.';
      if (session.status === 'DEACTIVATED') msg = 'Your account has been deactivated.';

      return res.status(403).json({
        error: 'Forbidden',
        status: session.status,
        message: msg
      });
    }

    // Update last_active_at non-blocking
    query('UPDATE sessions SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1', [session.session_id])
      .catch((err) => logger.error('Failed to update session last_active_at', { error: err.message }));

    req.user = {
      id: session.id,
      username: session.username,
      email: session.email,
      displayName: session.display_name,
      avatarUrl: session.avatar_url,
      bio: session.bio,
      role: session.role,
      status: session.status
    };

    req.session = {
      id: session.session_id,
      token
    };

    next();
  } catch (err) {
    logger.error('Error during authentication middleware', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to authenticate request.'
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware.
 * @param {string[]} allowedRoles - Array of roles permitted (e.g. ['ADMIN'], ['ADMIN', 'MODERATOR'])
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Requires one of: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};
