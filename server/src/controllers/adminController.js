import { query } from '../config/db.js';
import { socketService } from '../services/socketService.js';
import { recordAudit } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

/**
 * Admin Dashboard Metrics.
 * Strictly calculates system metrics from real data.
 * MUST NOT expose private message previews or contents.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      activeUsersRes,
      pendingRequestsRes,
      suspendedAccountsRes,
      activeSessionsRes,
      failedLoginsRes
    ] = await Promise.all([
      query("SELECT count(*) as count FROM users WHERE status = 'ACTIVE'"),
      query("SELECT count(*) as count FROM access_requests WHERE status = 'PENDING'"),
      query("SELECT count(*) as count FROM users WHERE status = 'SUSPENDED'"),
      query("SELECT count(*) as count FROM sessions WHERE revoked_at IS NULL AND expires_at > $1", [new Date()]),
      query("SELECT count(*) as count FROM audit_logs WHERE action = 'FAILED_LOGIN_ATTEMPT'")
    ]);

    // Calculate online count from active WebSocket presence pool
    let onlineCount = 0;
    for (const [, status] of socketService.userPresence.entries()) {
      if (status === 'online') onlineCount++;
    }

    return res.status(200).json({
      metrics: {
        activeUsers: parseInt(activeUsersRes.rows[0].count, 10),
        onlineNow: onlineCount,
        pendingAccessRequests: parseInt(pendingRequestsRes.rows[0].count, 10),
        suspendedAccounts: parseInt(suspendedAccountsRes.rows[0].count, 10),
        activeSessions: parseInt(activeSessionsRes.rows[0].count, 10),
        failedLoginAttempts: parseInt(failedLoginsRes.rows[0].count, 10)
      }
    });
  } catch (err) {
    logger.error('Admin dashboard stats error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve metrics.' });
  }
};

/**
 * Admin: List & search all user accounts.
 */
export const listAllUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;

    let sql = `
      SELECT id, username, email, display_name, avatar_url, bio, role, status, created_at, last_login_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(username) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(display_name) LIKE $${params.length})`;
    }

    if (role) {
      params.push(role.toUpperCase());
      sql += ` AND role = $${params.length}`;
    }

    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return res.status(200).json({ users: result.rows });
  } catch (err) {
    logger.error('Admin list users error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve users.' });
  }
};

/**
 * Admin: Update user account status (ACTIVE, SUSPENDED, DEACTIVATED).
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return res.status(400).json({ error: 'BadRequest', message: 'Invalid status value.' });
    }

    const userRes = await query('SELECT id, username, status, role FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    // Prevent admin from suspending/deactivating themselves
    if (targetUser.id === adminId && status !== 'ACTIVE') {
      return res.status(400).json({ error: 'BadRequest', message: 'You cannot suspend or deactivate your own account.' });
    }

    await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);

    // If account suspended or deactivated, immediately revoke all active sessions
    if (status !== 'ACTIVE') {
      await query('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND revoked_at IS NULL', [id]);
    }

    await recordAudit({
      adminId,
      action: 'USER_STATUS_UPDATED',
      targetUserId: id,
      metadata: { previousStatus: targetUser.status, newStatus: status, username: targetUser.username }
    });

    return res.status(200).json({
      message: `User status updated to ${status}.`,
      user: { id, status }
    });
  } catch (err) {
    logger.error('Update user status error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to update user status.' });
  }
};

/**
 * Admin: Assign platform role (MEMBER, MODERATOR, ADMIN).
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user.id;

    if (!['MEMBER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'BadRequest', message: 'Invalid role value.' });
    }

    const userRes = await query('SELECT id, username, role FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
    }

    const targetUser = userRes.rows[0];

    // Prevent admin from demoting themselves
    if (targetUser.id === adminId && role !== 'ADMIN') {
      return res.status(400).json({ error: 'BadRequest', message: 'You cannot remove your own administrator role.' });
    }

    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);

    await recordAudit({
      adminId,
      action: 'USER_ROLE_UPDATED',
      targetUserId: id,
      metadata: { previousRole: targetUser.role, newRole: role, username: targetUser.username }
    });

    return res.status(200).json({
      message: `User role updated to ${role}.`,
      user: { id, role }
    });
  } catch (err) {
    logger.error('Update user role error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to update user role.' });
  }
};

/**
 * Admin: Delete user account.
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    if (id === adminId) {
      return res.status(400).json({ error: 'BadRequest', message: 'You cannot delete your own account.' });
    }

    const userRes = await query('SELECT id, username FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found.' });
    }

    await query('DELETE FROM users WHERE id = $1', [id]);

    await recordAudit({
      adminId,
      action: 'USER_DELETED',
      targetUserId: id,
      metadata: { username: userRes.rows[0].username }
    });

    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    logger.error('Delete user error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete user.' });
  }
};

/**
 * Admin: Inspect active user sessions (without secrets).
 */
export const listSessions = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        s.id,
        s.user_id,
        s.user_agent,
        s.ip_address,
        s.created_at,
        s.last_active_at,
        s.expires_at,
        s.revoked_at,
        u.username,
        u.display_name,
        u.email,
        u.role
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.revoked_at IS NULL AND s.expires_at > $1
      ORDER BY s.last_active_at DESC
      LIMIT 100
    `, [new Date()]);

    return res.status(200).json({ sessions: result.rows });
  } catch (err) {
    logger.error('List sessions error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve sessions.' });
  }
};

/**
 * Admin: Revoke session (force logout).
 */
export const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const sessionRes = await query('SELECT id, user_id FROM sessions WHERE id = $1', [id]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Session not found.' });
    }

    await query('UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    await recordAudit({
      adminId,
      action: 'SESSION_FORCE_REVOKED',
      targetUserId: sessionRes.rows[0].user_id,
      metadata: { sessionId: id }
    });

    return res.status(200).json({ success: true, message: 'Session revoked successfully.' });
  } catch (err) {
    logger.error('Revoke session error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to revoke session.' });
  }
};

/**
 * Admin: List platform audit logs.
 * Enforces privacy boundary: message bodies are NEVER present in audit logs.
 */
export const listAuditLogs = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        al.id,
        al.action,
        al.metadata,
        al.created_at,
        admin.username AS admin_username,
        target.username AS target_username
      FROM audit_logs al
      LEFT JOIN users admin ON al.admin_id = admin.id
      LEFT JOIN users target ON al.target_user_id = target.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);

    const logs = result.rows.map(l => ({
      id: l.id,
      action: l.action,
      adminUsername: l.admin_username,
      targetUsername: l.target_username,
      metadata: typeof l.metadata === 'string' ? JSON.parse(l.metadata || '{}') : (l.metadata || {}),
      createdAt: l.created_at
    }));

    return res.status(200).json({ logs });
  } catch (err) {
    logger.error('List audit logs error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve audit logs.' });
  }
};

/**
 * Admin: Security events dashboard.
 */
export const getSecurityEvents = async (req, res) => {
  try {
    const securityLogs = await query(`
      SELECT 
        al.id,
        al.action,
        al.metadata,
        al.created_at,
        target.username AS target_username
      FROM audit_logs al
      LEFT JOIN users target ON al.target_user_id = target.id
      WHERE al.action IN ('FAILED_LOGIN_ATTEMPT', 'BLOCKED_LOGIN_INACTIVE_ACCOUNT', 'SESSION_FORCE_REVOKED', 'USER_STATUS_UPDATED', 'USER_ROLE_UPDATED')
      ORDER BY al.created_at DESC
      LIMIT 50
    `);

    return res.status(200).json({
      events: securityLogs.rows.map(e => ({
        id: e.id,
        action: e.action,
        targetUsername: e.target_username,
        metadata: typeof e.metadata === 'string' ? JSON.parse(e.metadata || '{}') : (e.metadata || {}),
        createdAt: e.created_at
      }))
    });
  } catch (err) {
    logger.error('Get security events error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve security events.' });
  }
};
