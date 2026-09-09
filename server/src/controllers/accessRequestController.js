import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { recordAudit } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

/**
 * Public: Submit a community access request.
 */
export const submitAccessRequest = async (req, res) => {
  try {
    const { name, email, requestedUsername, reason, password } = req.body;

    if (!name || !email || !requestedUsername || !reason) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Name, email, requested username, and reason are required.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = requestedUsername.trim().toLowerCase();

    // Check if username or email already exists in users
    const existingUser = await query(`
      SELECT id, username, email FROM users
      WHERE LOWER(username) = $1 OR LOWER(email) = $2
    `, [trimmedUsername, trimmedEmail]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A user with this username or email already exists.'
      });
    }

    // Check if pending request exists
    const existingReq = await query(`
      SELECT id FROM access_requests
      WHERE (LOWER(requested_username) = $1 OR LOWER(email) = $2) AND status = 'PENDING'
    `, [trimmedUsername, trimmedEmail]);

    if (existingReq.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'An access request for this username or email is already pending review.'
      });
    }

    const requestId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const saltRounds = 10;
    const initialPassword = password ? password : crypto.randomBytes(12).toString('hex');
    const passwordHash = bcrypt.hashSync(initialPassword, saltRounds);

    // Create user in PENDING status
    await query(`
      INSERT INTO users (id, username, email, password_hash, display_name, role, status, bio)
      VALUES ($1, $2, $3, $4, $5, 'MEMBER', 'PENDING', $6)
    `, [userId, trimmedUsername, trimmedEmail, passwordHash, name.trim(), reason.trim()]);

    // Create access request
    await query(`
      INSERT INTO access_requests (id, name, email, requested_username, reason, status)
      VALUES ($1, $2, $3, $4, $5, 'PENDING')
    `, [requestId, name.trim(), trimmedEmail, trimmedUsername, reason.trim()]);

    return res.status(201).json({
      message: 'Access request submitted successfully. It will be reviewed by an administrator.',
      requestId,
      status: 'PENDING'
    });
  } catch (err) {
    logger.error('Submit access request error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to submit community access request.'
    });
  }
};

/**
 * Admin: List access requests with optional status filter.
 */
export const listAccessRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT 
        ar.id,
        ar.name,
        ar.email,
        ar.requested_username,
        ar.reason,
        ar.status,
        ar.created_at,
        ar.reviewed_at,
        u.username AS reviewer_username
      FROM access_requests ar
      LEFT JOIN users u ON ar.reviewed_by = u.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE ar.status = $1';
      params.push(status.toUpperCase());
    }

    sql += ' ORDER BY ar.created_at DESC';

    const result = await query(sql, params);
    return res.status(200).json({ requests: result.rows });
  } catch (err) {
    logger.error('List access requests error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve access requests.'
    });
  }
};

/**
 * Admin: Approve or reject an access request.
 */
export const reviewAccessRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        error: 'BadRequest',
        message: "Status must be 'APPROVED' or 'REJECTED'."
      });
    }

    const reqResult = await query('SELECT * FROM access_requests WHERE id = $1', [id]);
    if (reqResult.rows.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Access request not found.'
      });
    }

    const requestItem = reqResult.rows[0];

    // Update access request status
    await query(`
      UPDATE access_requests
      SET status = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
      WHERE id = $3
    `, [status, adminId, id]);

    // Find and update the user record
    const userResult = await query(`
      SELECT id, username, email FROM users
      WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)
    `, [requestItem.email, requestItem.requested_username]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      const newStatus = status === 'APPROVED' ? 'ACTIVE' : 'DEACTIVATED';
      
      await query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, user.id]);

      // If approved, automatically join user to public channels
      if (status === 'APPROVED') {
        const publicChannels = await query("SELECT id FROM channels WHERE type = 'PUBLIC'");
        for (const ch of publicChannels.rows) {
          await query(`
            INSERT INTO channel_members (channel_id, user_id, role)
            VALUES ($1, $2, 'MEMBER')
            ON CONFLICT (channel_id, user_id) DO NOTHING
          `, [ch.id, user.id]);

          // Also add to conversation
          const conv = await query('SELECT id FROM conversations WHERE channel_id = $1', [ch.id]);
          if (conv.rows.length > 0) {
            await query(`
              INSERT INTO conversation_members (conversation_id, user_id)
              VALUES ($1, $2)
              ON CONFLICT (conversation_id, user_id) DO NOTHING
            `, [conv.rows[0].id, user.id]);
          }
        }
      }

      await recordAudit({
        adminId,
        action: status === 'APPROVED' ? 'ACCESS_REQUEST_APPROVED' : 'ACCESS_REQUEST_REJECTED',
        targetUserId: user.id,
        metadata: { requestId: id, email: requestItem.email, username: requestItem.requested_username }
      });
    }

    return res.status(200).json({
      message: `Access request has been ${status.toLowerCase()}.`,
      request: {
        id,
        status,
        reviewedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    logger.error('Review access request error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to process access request review.'
    });
  }
};
