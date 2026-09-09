import crypto from 'crypto';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * List channels accessible to the current user:
 * - All PUBLIC channels
 * - PRIVATE channels where the user is a member (in channel_members)
 */
export const listChannels = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.type,
        c.created_at,
        c.created_by,
        conv.id AS conversation_id,
        (cm.user_id IS NOT NULL) AS is_member
      FROM channels c
      LEFT JOIN conversations conv ON conv.channel_id = c.id
      LEFT JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = $1
      WHERE c.type = 'PUBLIC' OR cm.user_id IS NOT NULL
      ORDER BY c.name ASC
    `, [userId]);

    return res.status(200).json({ channels: result.rows });
  } catch (err) {
    logger.error('List channels error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve channels.'
    });
  }
};

/**
 * Create a new channel (PUBLIC or PRIVATE) and its associated conversation.
 */
export const createChannel = async (req, res) => {
  try {
    const { name, description, type = 'PUBLIC' } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Channel name is required.'
      });
    }

    const sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const channelType = type.toUpperCase() === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC';

    // Check if channel name exists
    const existing = await query('SELECT id FROM channels WHERE name = $1', [sanitizedName]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: 'Conflict',
        message: `Channel '#${sanitizedName}' already exists.`
      });
    }

    const channelId = crypto.randomUUID();
    const conversationId = crypto.randomUUID();

    // Create channel
    await query(`
      INSERT INTO channels (id, name, description, type, created_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [channelId, sanitizedName, description ? description.trim() : '', channelType, userId]);

    // Create associated conversation
    await query(`
      INSERT INTO conversations (id, type, channel_id)
      VALUES ($1, 'CHANNEL', $2)
    `, [conversationId, channelId]);

    // Add creator as channel & conversation member
    await query(`
      INSERT INTO channel_members (channel_id, user_id, role)
      VALUES ($1, $2, 'ADMIN')
    `, [channelId, userId]);

    await query(`
      INSERT INTO conversation_members (conversation_id, user_id)
      VALUES ($1, $2)
    `, [conversationId, userId]);

    return res.status(201).json({
      message: 'Channel created successfully.',
      channel: {
        id: channelId,
        name: sanitizedName,
        description,
        type: channelType,
        conversationId,
        created_by: userId
      }
    });
  } catch (err) {
    logger.error('Create channel error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to create channel.'
    });
  }
};

/**
 * Get channel details with privacy verification.
 */
export const getChannelById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const channelResult = await query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.type,
        c.created_at,
        c.created_by,
        conv.id AS conversation_id
      FROM channels c
      LEFT JOIN conversations conv ON conv.channel_id = c.id
      WHERE c.id = $1
    `, [id]);

    if (channelResult.rows.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'Channel not found.'
      });
    }

    const channel = channelResult.rows[0];

    // Privacy boundary: Private channels require explicit membership
    if (channel.type === 'PRIVATE') {
      const memberCheck = await query(`
        SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2
      `, [id, userId]);

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You are not an authorized member of this private channel.'
        });
      }
    }

    // Fetch member count
    const memberCountRes = await query(`
      SELECT count(*) as count FROM channel_members WHERE channel_id = $1
    `, [id]);

    return res.status(200).json({
      channel: {
        ...channel,
        memberCount: parseInt(memberCountRes.rows[0].count, 10)
      }
    });
  } catch (err) {
    logger.error('Get channel by id error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve channel.'
    });
  }
};

/**
 * Join a public channel.
 */
export const joinChannel = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const channelResult = await query('SELECT id, type FROM channels WHERE id = $1', [id]);
    if (channelResult.rows.length === 0) {
      return res.status(404).json({ error: 'NotFound', message: 'Channel not found.' });
    }

    const channel = channelResult.rows[0];
    if (channel.type === 'PRIVATE') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Private channels require an invitation from an existing member.'
      });
    }

    await query(`
      INSERT INTO channel_members (channel_id, user_id, role)
      VALUES ($1, $2, 'MEMBER')
      ON CONFLICT (channel_id, user_id) DO NOTHING
    `, [id, userId]);

    // Join conversation
    const conv = await query('SELECT id FROM conversations WHERE channel_id = $1', [id]);
    if (conv.rows.length > 0) {
      await query(`
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (conversation_id, user_id) DO NOTHING
      `, [conv.rows[0].id, userId]);
    }

    return res.status(200).json({ message: 'Successfully joined channel.' });
  } catch (err) {
    logger.error('Join channel error', { error: err.message });
    return res.status(500).json({ error: 'InternalServerError', message: 'Failed to join channel.' });
  }
};
