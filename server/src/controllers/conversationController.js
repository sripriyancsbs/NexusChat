import crypto from 'crypto';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * List all conversations for current user (Channels, DMs, Groups)
 * with unread counts and latest message.
 */
export const listConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        c.id,
        c.type,
        c.channel_id,
        c.created_at,
        cm.last_read_at,
        ch.name AS channel_name,
        ch.type AS channel_type
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id AND cm.user_id = $1
      LEFT JOIN channels ch ON c.channel_id = ch.id
      ORDER BY c.created_at DESC
    `, [userId]);

    const conversations = [];
    for (const row of result.rows) {
      // Get latest message for this conversation
      const msgRes = await query(`
        SELECT id, content, created_at, sender_id, deleted_at
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [row.id]);

      let unreadCount = 0;
      if (row.last_read_at) {
        const unreadRes = await query(`
          SELECT count(*) as count
          FROM messages
          WHERE conversation_id = $1
            AND created_at > $2
            AND sender_id != $3
        `, [row.id, row.last_read_at, userId]);
        unreadCount = parseInt(unreadRes.rows[0]?.count || '0', 10);
      }

      const lastMsg = msgRes.rows[0] ? {
        id: msgRes.rows[0].id,
        content: msgRes.rows[0].content,
        createdAt: msgRes.rows[0].created_at,
        created_at: msgRes.rows[0].created_at,
        senderId: msgRes.rows[0].sender_id,
        sender_id: msgRes.rows[0].sender_id
      } : null;

      const conv = {
        id: row.id,
        type: row.type,
        channelId: row.channel_id,
        channel_id: row.channel_id,
        channelName: row.channel_name,
        channel_name: row.channel_name,
        channelType: row.channel_type,
        channel_type: row.channel_type,
        createdAt: row.created_at,
        created_at: row.created_at,
        lastReadAt: row.last_read_at,
        last_read_at: row.last_read_at,
        lastMessage: lastMsg,
        last_message: lastMsg,
        unreadCount,
        unread_count: unreadCount,
        participants: []
      };

      if (row.type === 'DIRECT' || row.type === 'GROUP') {
        const members = await query(`
          SELECT u.id, u.username, u.display_name, u.avatar_url, u.status, u.role
          FROM conversation_members cm2
          JOIN users u ON cm2.user_id = u.id
          WHERE cm2.conversation_id = $1
        `, [row.id]);

        conv.participants = members.rows.map((m) => ({
          id: m.id,
          username: m.username,
          displayName: m.display_name,
          full_name: m.display_name || m.username,
          avatarUrl: m.avatar_url,
          status: m.status,
          role: m.role
        }));

        if (row.type === 'DIRECT') {
          const other = conv.participants.find((p) => p.id !== userId) || null;
          conv.targetUser = other;
          conv.other_user = other;
        }
      }

      conversations.push(conv);
    }

    return res.status(200).json({ conversations });
  } catch (err) {
    logger.error('List conversations error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve conversations.'
    });
  }
};

/**
 * Get or create a private direct message conversation between current user and target user.
 */
export const getOrCreateDirect = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'targetUserId is required.'
      });
    }

    if (targetUserId === currentUserId) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Cannot initiate direct message with yourself.'
      });
    }

    // Verify target user exists and is active
    const targetUserRes = await query(`
      SELECT id, username, display_name, avatar_url, role, status
      FROM users WHERE id = $1 AND status = 'ACTIVE'
    `, [targetUserId]);

    if (targetUserRes.rows.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Target user does not exist or is not active.'
      });
    }

    const targetUser = targetUserRes.rows[0];

    // Check if an existing 2-person DIRECT conversation exists
    const existingConv = await query(`
      SELECT c.id 
      FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = $1
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = $2
      WHERE c.type = 'DIRECT'
      LIMIT 1
    `, [currentUserId, targetUserId]);

    if (existingConv.rows.length > 0) {
      return res.status(200).json({
        conversation: {
          id: existingConv.rows[0].id,
          type: 'DIRECT',
          targetUser: {
            id: targetUser.id,
            username: targetUser.username,
            displayName: targetUser.display_name,
            avatarUrl: targetUser.avatar_url
          }
        }
      });
    }

    // Create new direct conversation
    const conversationId = crypto.randomUUID();
    await query(`
      INSERT INTO conversations (id, type)
      VALUES ($1, 'DIRECT')
    `, [conversationId]);

    // Insert both members
    await query(`
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES ($1, $2), ($1, $3)
    `, [conversationId, currentUserId, targetUserId]);

    return res.status(201).json({
      conversation: {
        id: conversationId,
        type: 'DIRECT',
        targetUser: {
          id: targetUser.id,
          username: targetUser.username,
          displayName: targetUser.display_name,
          avatarUrl: targetUser.avatar_url
        }
      }
    });
  } catch (err) {
    logger.error('Get or create direct conversation error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to initiate direct message conversation.'
    });
  }
};

/**
 * Mark conversation as read for the requesting user.
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(`
      UPDATE conversation_members
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2
    `, [id, userId]);

    return res.status(200).json({ success: true, conversationId: id });
  } catch (err) {
    logger.error('Mark conversation as read error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to update read state.' });
  }
};
