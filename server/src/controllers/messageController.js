import crypto from 'crypto';
import { query } from '../config/db.js';
import { socketService } from '../services/socketService.js';
import { logger } from '../utils/logger.js';

/**
 * Helper: Verify if user is authorized to access a conversation.
 * Returns true if:
 * 1. User is in conversation_members, OR
 * 2. Conversation belongs to a PUBLIC channel.
 */
export const checkConversationAccess = async (conversationId, userId) => {
  // 1. Check if user is an explicit member
  const memberCheck = await query(`
    SELECT 1 FROM conversation_members 
    WHERE conversation_id = $1 AND user_id = $2
  `, [conversationId, userId]);

  if (memberCheck.rows.length > 0) return true;

  // 2. If not member, check if conversation belongs to a PUBLIC channel
  const publicChannelCheck = await query(`
    SELECT c.id FROM conversations c
    JOIN channels ch ON c.channel_id = ch.id
    WHERE c.id = $1 AND ch.type = 'PUBLIC'
  `, [conversationId]);

  if (publicChannelCheck.rows.length > 0) {
    await query(`
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (conversation_id, user_id) DO NOTHING
    `, [conversationId, userId]);
    return true;
  }

  return false;
};

/**
 * Get messages for a conversation.
 * Strictly checks user authorization!
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const limit = parseInt(req.query.limit || '50', 10);
    const before = req.query.before; // pagination timestamp

    const isAuthorized = await checkConversationAccess(conversationId, userId);
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to view messages in this conversation.'
      });
    }

    let sql = `
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        CASE 
          WHEN m.deleted_at IS NOT NULL THEN 'This message was deleted.'
          ELSE m.content 
        END AS content,
        m.reply_to_message_id,
        m.is_pinned,
        m.pinned_by,
        m.pinned_at,
        m.created_at,
        m.updated_at,
        m.deleted_at,
        u.username AS sender_username,
        u.display_name AS sender_display_name,
        u.avatar_url AS sender_avatar_url
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
    `;
    const params = [conversationId];

    if (before) {
      sql += ' AND m.created_at < $2';
      params.push(before);
    }

    sql += ` ORDER BY m.created_at ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);
    const messages = result.rows;

    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);

      // Fetch reactions
      const placeholders = messageIds.map((_, i) => `$${i + 1}`).join(', ');
      const reactionsRes = await query(`
        SELECT mr.id, mr.message_id, mr.reaction, mr.user_id, u.username
        FROM message_reactions mr
        JOIN users u ON mr.user_id = u.id
        WHERE mr.message_id IN (${placeholders})
      `, messageIds);

      // Fetch reply counts
      const replyRes = await query(`
        SELECT reply_to_message_id, count(*) as count
        FROM messages
        WHERE reply_to_message_id IN (${placeholders}) AND deleted_at IS NULL
        GROUP BY reply_to_message_id
      `, messageIds);

      const reactionsByMsg = {};
      for (const r of reactionsRes.rows) {
        if (!reactionsByMsg[r.message_id]) reactionsByMsg[r.message_id] = [];
        reactionsByMsg[r.message_id].push({
          id: r.id,
          reaction: r.reaction,
          userId: r.user_id,
          username: r.username
        });
      }

      const replyCountByMsg = {};
      for (const rep of replyRes.rows) {
        replyCountByMsg[rep.reply_to_message_id] = parseInt(rep.count, 10);
      }

      for (const msg of messages) {
        msg.reactions = reactionsByMsg[msg.id] || [];
        msg.reply_count = replyCountByMsg[msg.id] || 0;
      }
    }

    return res.status(200).json({ messages });
  } catch (err) {
    logger.error('Get messages error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve messages.'
    });
  }
};

/**
 * Send a new message to a conversation.
 * Strictly checks user authorization!
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, replyToMessageId } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Message content cannot be empty.'
      });
    }

    const isAuthorized = await checkConversationAccess(conversationId, userId);
    if (!isAuthorized) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not authorized to post in this conversation.'
      });
    }

    const messageId = crypto.randomUUID();

    await query(`
      INSERT INTO messages (id, conversation_id, sender_id, content, reply_to_message_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [messageId, conversationId, userId, content.trim(), replyToMessageId || null]);

    // Update sender's last_read_at
    await query(`
      UPDATE conversation_members 
      SET last_read_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = $1 AND user_id = $2
    `, [conversationId, userId]);

    // Fetch created message with sender info
    const messageResult = await query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.reply_to_message_id,
        m.is_pinned,
        m.created_at,
        u.username AS sender_username,
        u.display_name AS sender_display_name,
        u.avatar_url AS sender_avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = $1
    `, [messageId]);

    const createdMsg = messageResult.rows[0];

    // Real-time broadcast strictly to conversation participants
    socketService.broadcastToConversation(conversationId, 'message:new', {
      message: createdMsg
    });

    return res.status(201).json({
      message: createdMsg
    });
  } catch (err) {
    logger.error('Send message error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to send message.'
    });
  }
};

/**
 * Edit an existing message (Owner only).
 */
export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Content cannot be empty.'
      });
    }

    const msgRes = await query('SELECT * FROM messages WHERE id = $1', [id]);
    if (msgRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Message not found.' });
    }

    const msg = msgRes.rows[0];
    if (msg.sender_id !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own messages.'
      });
    }

    if (msg.deleted_at) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Cannot edit a deleted message.'
      });
    }

    const updatedAt = new Date().toISOString();
    await query(`
      UPDATE messages 
      SET content = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [content.trim(), id]);

    // Real-time broadcast
    socketService.broadcastToConversation(msg.conversation_id, 'message:edit', {
      conversationId: msg.conversation_id,
      messageId: id,
      content: content.trim(),
      updatedAt
    });

    return res.status(200).json({
      message: {
        id,
        content: content.trim(),
        updatedAt
      }
    });
  } catch (err) {
    logger.error('Edit message error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to edit message.' });
  }
};

/**
 * Delete a message (Soft delete, owner only).
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const msgRes = await query('SELECT * FROM messages WHERE id = $1', [id]);
    if (msgRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Message not found.' });
    }

    const msg = msgRes.rows[0];
    if (msg.sender_id !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own messages.'
      });
    }

    const deletedAt = new Date().toISOString();
    await query('UPDATE messages SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);

    // Real-time broadcast
    socketService.broadcastToConversation(msg.conversation_id, 'message:delete', {
      conversationId: msg.conversation_id,
      messageId: id,
      deletedAt
    });

    return res.status(200).json({
      success: true,
      messageId: id,
      deletedAt
    });
  } catch (err) {
    logger.error('Delete message error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete message.' });
  }
};

/**
 * Toggle reaction on a message.
 */
export const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    const userId = req.user.id;

    if (!reaction || reaction.trim().length === 0) {
      return res.status(400).json({ error: 'BadRequest', message: 'Reaction is required.' });
    }

    const sanitizedReaction = reaction.trim();

    // Check message exists and user has access to message's conversation
    const msgRes = await query('SELECT conversation_id FROM messages WHERE id = $1', [id]);
    if (msgRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Message not found.' });
    }

    const conversationId = msgRes.rows[0].conversation_id;
    const isAuthorized = await checkConversationAccess(conversationId, userId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized conversation access.' });
    }

    // Check if reaction already exists
    const existing = await query(`
      SELECT id FROM message_reactions 
      WHERE message_id = $1 AND user_id = $2 AND reaction = $3
    `, [id, userId, sanitizedReaction]);

    if (existing.rows.length > 0) {
      // Remove reaction
      await query('DELETE FROM message_reactions WHERE id = $1', [existing.rows[0].id]);

      socketService.broadcastToConversation(conversationId, 'reaction:toggle', {
        conversationId,
        messageId: id,
        reaction: sanitizedReaction,
        userId,
        username: req.user.username,
        action: 'REMOVED'
      });

      return res.status(200).json({ action: 'REMOVED', reaction: sanitizedReaction, messageId: id });
    } else {
      // Add reaction
      const reactionId = crypto.randomUUID();
      await query(`
        INSERT INTO message_reactions (id, message_id, user_id, reaction)
        VALUES ($1, $2, $3, $4)
      `, [reactionId, id, userId, sanitizedReaction]);

      socketService.broadcastToConversation(conversationId, 'reaction:toggle', {
        conversationId,
        messageId: id,
        reaction: sanitizedReaction,
        userId,
        username: req.user.username,
        action: 'ADDED'
      });

      return res.status(201).json({ action: 'ADDED', reaction: sanitizedReaction, messageId: id });
    }
  } catch (err) {
    logger.error('Toggle reaction error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to toggle reaction.' });
  }
};

/**
 * Toggle pin status on a message.
 */
export const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const msgRes = await query('SELECT conversation_id, is_pinned FROM messages WHERE id = $1', [id]);
    if (msgRes.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Message not found.' });
    }

    const msg = msgRes.rows[0];
    const isAuthorized = await checkConversationAccess(msg.conversation_id, userId);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized conversation access.' });
    }

    const newPinStatus = !msg.is_pinned;
    await query(`
      UPDATE messages 
      SET is_pinned = $1, pinned_by = $2, pinned_at = $3
      WHERE id = $4
    `, [newPinStatus, newPinStatus ? userId : null, newPinStatus ? new Date() : null, id]);

    socketService.broadcastToConversation(msg.conversation_id, 'pin:toggle', {
      conversationId: msg.conversation_id,
      messageId: id,
      isPinned: newPinStatus
    });

    return res.status(200).json({ isPinned: newPinStatus, messageId: id });
  } catch (err) {
    logger.error('Toggle pin error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to toggle pin.' });
  }
};
