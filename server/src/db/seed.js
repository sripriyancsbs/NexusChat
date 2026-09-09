import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, initDb } from '../config/db.js';
import { logger } from '../utils/logger.js';

export const seedDatabase = async () => {
  logger.info('Starting database seeding...');
  await initDb();

  // Check if users already exist
  const existingUsers = await query('SELECT count(*) as count FROM users');
  if (parseInt(existingUsers.rows[0].count, 10) > 0) {
    logger.info('Database already contains user records. Skipping seed.');
    return;
  }

  const saltRounds = 10;
  const adminPass = bcrypt.hashSync('AdminSecure2026!', saltRounds);
  const modPass = bcrypt.hashSync('ModSecure2026!', saltRounds);
  const memberPass = bcrypt.hashSync('NexusMember2026!', saltRounds);

  // 1. Seed Core Users (Admin, Moderator, Members)
  const adminId = crypto.randomUUID();
  const modId = crypto.randomUUID();
  const priyaId = crypto.randomUUID();
  const agenId = crypto.randomUUID();

  await query(`
    INSERT INTO users (id, username, email, password_hash, display_name, role, status, bio)
    VALUES
      ($1, 'admin', 'admin@nexuschat.internal', $2, 'System Administrator', 'ADMIN', 'ACTIVE', 'Platform Administrator'),
      ($3, 'moderator', 'moderator@nexuschat.internal', $4, 'Community Moderator', 'MODERATOR', 'ACTIVE', 'Community Moderator'),
      ($5, 'priya', 'priya@nexuschat.internal', $6, 'Priya Sharma', 'MEMBER', 'ACTIVE', 'Full-stack builder and privacy advocate'),
      ($7, 'agen', 'agen@nexuschat.internal', $8, 'Agen Chen', 'MEMBER', 'ACTIVE', 'Software Engineer')
  `, [adminId, adminPass, modId, modPass, priyaId, memberPass, agenId, memberPass]);

  // 2. Seed Public Channels
  const channels = [
    { name: 'general', description: 'General community discussion and greetings', type: 'PUBLIC' },
    { name: 'announcements', description: 'Platform news and community updates', type: 'PUBLIC' },
    { name: 'project-help', description: 'Collaborative troubleshooting and guidance', type: 'PUBLIC' },
    { name: 'projects', description: 'Showcase work and collaborate on ideas', type: 'PUBLIC' },
    { name: 'random', description: 'Casual, non-work discussions and coffee chat', type: 'PUBLIC' }
  ];

  for (const ch of channels) {
    const channelId = crypto.randomUUID();
    const conversationId = crypto.randomUUID();

    // Create channel
    await query(`
      INSERT INTO channels (id, name, description, type, created_by)
      VALUES ($1, $2, $3, $4, $5)
    `, [channelId, ch.name, ch.description, ch.type, adminId]);

    // Create associated conversation for channel
    await query(`
      INSERT INTO conversations (id, type, channel_id)
      VALUES ($1, 'CHANNEL', $2)
    `, [conversationId, channelId]);

    // Join all seed users to public channels
    for (const userId of [adminId, modId, priyaId, agenId]) {
      await query(`
        INSERT INTO channel_members (channel_id, user_id, role)
        VALUES ($1, $2, 'MEMBER')
      `, [channelId, userId]);

      await query(`
        INSERT INTO conversation_members (conversation_id, user_id)
        VALUES ($1, $2)
      `, [conversationId, userId]);
    }
  }

  logger.info('Database seeded successfully with core users and public channels.');
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => {
      logger.info('Seed runner finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error('Seed runner failed', { error: err.message });
      process.exit(1);
    });
}
