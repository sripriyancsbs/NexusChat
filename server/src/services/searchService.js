import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

/**
 * Scoped search service enforcing strict authorization boundaries.
 * Searches messages, channels, and people without ever leaking unauthorized content.
 */
export const searchAll = async (userId, searchTerm) => {
  try {
    const term = searchTerm.trim().toLowerCase();
    const likePattern = `%${term}%`;

    // 1. Search authorized messages
    const messageResults = await query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.content,
        m.created_at,
        u.username AS sender_username,
        u.display_name AS sender_display_name,
        c.type AS conversation_type,
        ch.name AS channel_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      JOIN conversations c ON m.conversation_id = c.id
      LEFT JOIN channels ch ON c.channel_id = ch.id
      WHERE (
        (c.type = 'CHANNEL' AND ch.type = 'PUBLIC')
        OR c.id IN (SELECT conversation_id FROM conversation_members WHERE user_id = $1)
      )
      AND m.deleted_at IS NULL
      AND LOWER(m.content) LIKE $2
      ORDER BY m.created_at DESC
      LIMIT 25
    `, [userId, likePattern]);

    // 2. Search accessible channels
    const channelResults = await query(`
      SELECT 
        c.id, 
        c.name, 
        c.description, 
        c.type, 
        conv.id AS conversation_id
      FROM channels c
      LEFT JOIN conversations conv ON conv.channel_id = c.id
      LEFT JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = $1
      WHERE (c.type = 'PUBLIC' OR cm.user_id IS NOT NULL)
      AND (LOWER(c.name) LIKE $2 OR LOWER(c.description) LIKE $2)
      ORDER BY c.name ASC
      LIMIT 10
    `, [userId, likePattern]);

    // 3. Search active community members
    const peopleResults = await query(`
      SELECT id, username, display_name, avatar_url, bio, role
      FROM users
      WHERE status = 'ACTIVE'
      AND (LOWER(username) LIKE $1 OR LOWER(display_name) LIKE $1)
      ORDER BY display_name ASC
      LIMIT 10
    `, [likePattern]);

    return {
      query: searchTerm,
      messages: messageResults.rows,
      channels: channelResults.rows,
      people: peopleResults.rows
    };
  } catch (err) {
    logger.error('Scoped search error', { error: err.message, userId });
    throw err;
  }
};
