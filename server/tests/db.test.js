import test from 'node:test';
import assert from 'node:assert/strict';
import { query, initDb } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';

test('Database schema initializes all 12 core tables', async () => {
  await initDb();
  await seedDatabase();

  const tables = [
    'users',
    'channels',
    'channel_members',
    'conversations',
    'conversation_members',
    'messages',
    'message_reactions',
    'sessions',
    'notifications',
    'access_requests',
    'audit_logs',
    'reports'
  ];

  for (const table of tables) {
    const result = await query(`SELECT count(*) FROM ${table}`);
    assert.ok(result.rows, `Table ${table} should return rows`);
  }
});

test('Seeder populates core users and public channels', async () => {
  const usersResult = await query('SELECT username, role, status FROM users ORDER BY username ASC');
  const usernames = usersResult.rows.map(r => r.username);

  assert.ok(usernames.includes('admin'), 'Should contain admin user');
  assert.ok(usernames.includes('moderator'), 'Should contain moderator user');
  assert.ok(usernames.includes('priya'), 'Should contain priya user');
  assert.ok(usernames.includes('agen'), 'Should contain agen user');

  const channelsResult = await query('SELECT name FROM channels ORDER BY name ASC');
  const channelNames = channelsResult.rows.map(r => r.name);
  assert.ok(channelNames.includes('general'), 'Should contain general channel');
  assert.ok(channelNames.includes('announcements'), 'Should contain announcements channel');
});

test('Enforces check constraints on user roles and statuses', async () => {
  await assert.rejects(
    async () => {
      await query(`
        INSERT INTO users (id, username, email, password_hash, display_name, role, status)
        VALUES ('invalid-id', 'hacker', 'hacker@bad.com', 'hash', 'Hacker', 'SUPERUSER', 'ACTIVE')
      `);
    },
    /check constraint/i,
    'Invalid role should violate check constraint'
  );
});

test('Enforces uniqueness constraint on usernames', async () => {
  await assert.rejects(
    async () => {
      await query(`
        INSERT INTO users (id, username, email, password_hash, display_name, role, status)
        VALUES ('dup-id', 'admin', 'another-admin@nexuschat.internal', 'hash', 'Duplicate Admin', 'ADMIN', 'ACTIVE')
      `);
    },
    /unique/i,
    'Duplicate username should violate unique constraint'
  );
});
