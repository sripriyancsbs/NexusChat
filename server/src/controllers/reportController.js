import crypto from 'crypto';
import { query } from '../config/db.js';
import { recordAudit } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

/**
 * Member: Submit a content report.
 */
export const submitReport = async (req, res) => {
  try {
    const { messageId, reason } = req.body;
    const reporterId = req.user.id;

    if (!messageId || !reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'BadRequest', message: 'Message ID and reason are required.' });
    }

    // Verify message exists
    const msgRes = await query('SELECT id, conversation_id FROM messages WHERE id = $1', [messageId]);
    if (msgRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Message not found.' });
    }

    const reportId = crypto.randomUUID();
    await query(`
      INSERT INTO reports (id, reporter_id, message_id, reason, status)
      VALUES ($1, $2, $3, $4, 'PENDING')
    `, [reportId, reporterId, messageId, reason.trim()]);

    return res.status(201).json({
      message: 'Report submitted successfully. A moderator will review the reported content.',
      reportId
    });
  } catch (err) {
    logger.error('Submit report error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to submit report.' });
  }
};

/**
 * Moderator / Admin: List moderation reports queue.
 */
export const listReports = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT 
        r.id,
        r.message_id,
        r.reason,
        r.status,
        r.created_at,
        r.resolved_at,
        reporter.username AS reporter_username,
        author.username AS author_username
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      JOIN messages m ON r.message_id = m.id
      JOIN users author ON m.sender_id = author.id
    `;
    const params = [];

    if (status) {
      sql += ' WHERE r.status = $1';
      params.push(status.toUpperCase());
    }

    sql += ' ORDER BY r.created_at DESC';

    const result = await query(sql, params);
    return res.status(200).json({ reports: result.rows });
  } catch (err) {
    logger.error('List reports error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to list reports.' });
  }
};

/**
 * Moderator / Admin: View reported content in isolated moderation context.
 */
export const getReportDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        r.id,
        r.reason,
        r.status,
        r.created_at,
        m.id AS message_id,
        m.content AS message_content,
        m.created_at AS message_created_at,
        reporter.username AS reporter_username,
        author.username AS author_username
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      JOIN messages m ON r.message_id = m.id
      JOIN users author ON m.sender_id = author.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Report not found.' });
    }

    return res.status(200).json({ report: result.rows[0] });
  } catch (err) {
    logger.error('Get report details error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve report details.' });
  }
};

/**
 * Moderator / Admin: Resolve report (DISMISSED, ACTIONED).
 */
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deleteMessage = false } = req.body;
    const moderatorId = req.user.id;

    if (!['DISMISSED', 'ACTIONED', 'REVIEWED'].includes(status)) {
      return res.status(400).json({ error: 'BadRequest', message: 'Invalid report status.' });
    }

    const reportRes = await query('SELECT * FROM reports WHERE id = $1', [id]);
    if (reportRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Report not found.' });
    }

    const report = reportRes.rows[0];

    await query(`
      UPDATE reports 
      SET status = $1, resolved_at = CURRENT_TIMESTAMP, assigned_to = $2 
      WHERE id = $3
    `, [status, moderatorId, id]);

    if (deleteMessage && status === 'ACTIONED') {
      await query('UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [report.message_id]);
    }

    await recordAudit({
      adminId: moderatorId,
      action: `REPORT_${status}`,
      metadata: { reportId: id, messageId: report.message_id, deleteMessage }
    });

    return res.status(200).json({
      message: `Report resolved as ${status}.`,
      reportId: id,
      status
    });
  } catch (err) {
    logger.error('Resolve report error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to resolve report.' });
  }
};
