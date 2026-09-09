import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { initDb, query } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';

test('Authentication & User Integration Suite', async (t) => {
  await initDb();
  await seedDatabase();

  let adminToken = '';
  let priyaToken = '';

  await t.test('POST /api/auth/login succeeds with valid admin credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin', password: 'AdminSecure2026!' });

    assert.equal(res.status, 200);
    assert.ok(res.body.token, 'Should return session token');
    assert.equal(res.body.user.username, 'admin');
    assert.equal(res.body.user.role, 'ADMIN');
    assert.equal(res.body.user.status, 'ACTIVE');
    assert.equal(res.body.user.password_hash, undefined, 'Must not expose password hash');

    adminToken = res.body.token;
  });

  await t.test('POST /api/auth/login succeeds with valid member credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'priya@nexuschat.internal', password: 'NexusMember2026!' });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.username, 'priya');
    assert.equal(res.body.user.role, 'MEMBER');

    priyaToken = res.body.token;
  });

  await t.test('POST /api/auth/login fails with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin', password: 'WrongPassword123' });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Unauthorized');
  });

  await t.test('POST /api/auth/login fails for non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'ghost_user', password: 'AnyPassword123' });

    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Unauthorized');
  });

  await t.test('POST /api/auth/login blocks suspended accounts with 403', async () => {
    // Suspend agen for test
    await query("UPDATE users SET status = 'SUSPENDED' WHERE username = 'agen'");

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'agen', password: 'NexusMember2026!' });

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Forbidden');
    assert.equal(res.body.status, 'SUSPENDED');

    // Restore agen
    await query("UPDATE users SET status = 'ACTIVE' WHERE username = 'agen'");
  });

  await t.test('GET /api/auth/session returns authenticated session', async () => {
    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.username, 'admin');
    assert.ok(res.body.session.id);
  });

  await t.test('GET /api/auth/session rejects requests without token', async () => {
    const res = await request(app).get('/api/auth/session');
    assert.equal(res.status, 401);
  });

  await t.test('GET /api/auth/session rejects invalid tokens', async () => {
    const res = await request(app)
      .get('/api/auth/session')
      .set('Authorization', 'Bearer invalid_token_12345');

    assert.equal(res.status, 401);
  });

  await t.test('GET /api/users/me returns authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.username, 'priya');
    assert.equal(res.body.user.email, 'priya@nexuschat.internal');
  });

  await t.test('PUT /api/users/me updates profile fields', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({
        displayName: 'Priya S.',
        bio: 'Updated bio for privacy testing'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.user.displayName, 'Priya S.');
    assert.equal(res.body.user.bio, 'Updated bio for privacy testing');
  });

  await t.test('GET /api/users lists active members without exposing password hashes', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.users));
    assert.ok(res.body.users.length >= 4);

    for (const u of res.body.users) {
      assert.equal(u.password_hash, undefined, 'Must not expose password_hash');
      assert.ok(u.username);
      assert.ok(u.displayName);
    }
  });

  await t.test('POST /api/auth/logout revokes session', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.body.success, true);

    // Subsequent session check must now fail
    const sessionRes = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(sessionRes.status, 401);
    assert.match(sessionRes.body.message, /revoked/i);
  });
});
