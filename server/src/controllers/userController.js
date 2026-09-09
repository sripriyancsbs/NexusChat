import { query } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const getMe = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

export const updateMe = async (req, res) => {
  try {
    const { displayName, avatarUrl, bio } = req.body;
    const userId = req.user.id;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (displayName !== undefined && displayName.trim().length > 0) {
      updates.push(`display_name = $${paramIndex++}`);
      params.push(displayName.trim());
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      params.push(avatarUrl ? avatarUrl.trim() : null);
    }

    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`);
      params.push(bio ? bio.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'No valid profile fields provided for update.'
      });
    }

    params.push(userId);
    const updateSql = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, username, email, display_name, avatar_url, bio, role, status
    `;

    const result = await query(updateSql, params);
    const updatedUser = result.rows[0];

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        displayName: updatedUser.display_name,
        avatarUrl: updatedUser.avatar_url,
        bio: updatedUser.bio,
        role: updatedUser.role,
        status: updatedUser.status
      }
    });
  } catch (err) {
    logger.error('Update profile error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to update profile.'
    });
  }
};

export const listUsers = async (req, res) => {
  try {
    // Only return ACTIVE community members, omit password_hash or internal secrets
    const result = await query(`
      SELECT id, username, display_name, avatar_url, bio, role, status
      FROM users
      WHERE status = 'ACTIVE'
      ORDER BY display_name ASC
    `);

    const users = result.rows.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
      bio: u.bio,
      role: u.role
    }));

    return res.status(200).json({ users });
  } catch (err) {
    logger.error('List users error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve community members.'
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, username, display_name, avatar_url, bio, role, status, created_at
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'User not found.'
      });
    }

    const u = result.rows[0];
    return res.status(200).json({
      user: {
        id: u.id,
        username: u.username,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        role: u.role,
        createdAt: u.created_at
      }
    });
  } catch (err) {
    logger.error('Get user by id error', { error: err.message });
    return res.status(500).json({
      error: 'InternalServerError',
      message: 'Failed to retrieve user.'
    });
  }
};
