import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { config } from '../config/env.js';
import { hashToken } from '../middleware/auth.js';
import { recordAudit } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Username/email and password are required.'
      });
    }

    // Lookup user by email or username (case-insensitive)
    const userResult = await query(`
      SELECT * FROM users
      WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
    `, [identifier.trim()]);

    if (userResult.rows.length === 0) {
      await recordAudit({
        action: 'FAILED_LOGIN_ATTEMPT',
        metadata: { identifier: identifier.trim(), reason: 'USER_NOT_FOUND', ip: req.ip }
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials.'
      });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await recordAudit({
        action: 'FAILED_LOGIN_ATTEMPT',
        targetUserId: user.id,
        metadata: { identifier: identifier.trim(), reason: 'INVALID_PASSWORD', ip: req.ip }
      });
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials.'
      });
    }

    // Enforce account status
    if (user.status !== 'ACTIVE') {
      let message = 'Account access is not active.';
      if (user.status === 'PENDING') message = 'Your access request is currently pending admin review.';
      if (user.status === 'SUSPENDED') message = 'Your account has been suspended by an administrator.';
      if (user.status === 'DEACTIVATED') message = 'Your account is deactivated.';

      await recordAudit({
        action: 'BLOCKED_LOGIN_INACTIVE_ACCOUNT',
        targetUserId: user.id,
        metadata: { status: user.status, ip: req.ip }
      });

      return res.status(403).json({
        error: 'Forbidden',
        status: user.status,
        message
      });
    }

    // Generate secure session token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const sessionId = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.sessionExpiryDays);

    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';

    // Store active session
    await query(`
      INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_address, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [sessionId, user.id, tokenHash, userAgent, ipAddress, expiresAt]);

    // Update last_login_at
    await query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    await recordAudit({
      action: 'USER_LOGIN',
      targetUserId: user.id,
      metadata: { userAgent, ip: ipAddress }
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    logger.error('Login error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'An unexpected error occurred during login.'
    });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.session?.id) {
      await query('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1', [req.session.id]);
      await recordAudit({
        action: 'USER_LOGOUT',
        targetUserId: req.user.id,
        metadata: { sessionId: req.session.id }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully logged out.'
    });
  } catch (err) {
    logger.error('Logout error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to process logout.'
    });
  }
};

export const getSession = async (req, res) => {
  return res.status(200).json({
    user: req.user,
    session: {
      id: req.session.id
    }
  });
};
