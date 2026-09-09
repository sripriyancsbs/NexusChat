import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { initDb, query } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';

test('Community Access Request Workflow Suite', async (t) => {
  await initDb();
  await seedDatabase();

  // Login as admin
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'admin', password: 'AdminSecure2026!' });
  const adminToken = adminLoginRes.body.token;

  // Login as member (priya)
  const priyaLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'priya', password: 'NexusMember2026!' });
  const priyaToken = priyaLoginRes.body.token;

  let requestId = '';
  const newEmail = 'newdev@example.com';
  const newUsername = 'newdev';
  const newPassword = 'NewDevPass2026!';

  await t.test('POST /api/access-requests submits a new request in PENDING state', async () => {
    const res = await request(app)
      .post('/api/access-requests')
      .send({
        name: 'Alex Rivera',
        email: newEmail,
        requestedUsername: newUsername,
        reason: 'Working on privacy-first web systems',
        password: newPassword
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'PENDING');
    assert.ok(res.body.requestId);
    requestId = res.body.requestId;
  });

  await t.test('POST /api/access-requests rejects duplicate username/email with 409', async () => {
    const res = await request(app)
      .post('/api/access-requests')
      .send({
        name: 'Alex Rivera Dup',
        email: newEmail,
        requestedUsername: newUsername,
        reason: 'Duplicate attempt'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.error, 'Conflict');
  });

  await t.test('User in PENDING state cannot log in', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: newUsername,
        password: newPassword
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.status, 'PENDING');
  });

  await t.test('Non-admin member cannot view access requests', async () => {
    const res = await request(app)
      .get('/api/access-requests/admin')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 403);
  });

  await t.test('Admin can list access requests', async () => {
    const res = await request(app)
      .get('/api/access-requests/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.requests));
    const target = res.body.requests.find(r => r.id === requestId);
    assert.ok(target, 'Should include the submitted request');
    assert.equal(target.status, 'PENDING');
  });

  await t.test('Admin approves access request and activates user', async () => {
    const res = await request(app)
      .patch(`/api/access-requests/admin/${requestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    assert.equal(res.status, 200);
    assert.equal(res.body.request.status, 'APPROVED');

    // Verify user is now ACTIVE in database
    const userCheck = await query('SELECT status FROM users WHERE username = $1', [newUsername]);
    assert.equal(userCheck.rows[0].status, 'ACTIVE');

    // Verify user is enrolled in public channels
    const membershipCheck = await query(`
      SELECT cm.channel_id, c.name
      FROM channel_members cm
      JOIN users u ON cm.user_id = u.id
      JOIN channels c ON cm.channel_id = c.id
      WHERE u.username = $1
    `, [newUsername]);
    assert.ok(membershipCheck.rows.length >= 5, 'Should be joined to all 5 default public channels');
  });

  await t.test('Newly approved user can now successfully log in', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: newUsername,
        password: newPassword
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.status, 'ACTIVE');
  });
});
