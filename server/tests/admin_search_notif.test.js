import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { initDb, query } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';
import { createNotification } from '../src/services/notificationService.js';

test('Admin Portal, Scoped Search, Notifications, and Moderation Suite', async (t) => {
  await initDb();
  await seedDatabase();

  // 1. Authenticate Priya (Member)
  const priyaLogin = await request(app).post('/api/auth/login').send({ identifier: 'priya', password: 'NexusMember2026!' });
  const priyaToken = priyaLogin.body.token;
  const priyaId = priyaLogin.body.user.id;

  // 2. Authenticate Agen (Member)
  const agenLogin = await request(app).post('/api/auth/login').send({ identifier: 'agen', password: 'NexusMember2026!' });
  let agenToken = agenLogin.body.token;
  const agenId = agenLogin.body.user.id;

  // 3. Authenticate Moderator
  const modLogin = await request(app).post('/api/auth/login').send({ identifier: 'moderator', password: 'ModSecure2026!' });
  const modToken = modLogin.body.token;

  // 4. Authenticate Admin
  const adminLogin = await request(app).post('/api/auth/login').send({ identifier: 'admin', password: 'AdminSecure2026!' });
  const adminToken = adminLogin.body.token;

  let notifId = '';
  let reportedMsgId = '';
  let reportId = '';

  await t.test('Notifications: Dispatch and retrieve authentic notification', async () => {
    const notif = await createNotification({
      userId: priyaId,
      type: 'channel_invite',
      metadata: { channelName: 'privacy-research' }
    });
    assert.ok(notif.id);
    notifId = notif.id;

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.unreadCount >= 1);
    const target = res.body.notifications.find(n => n.id === notifId);
    assert.ok(target);
    assert.equal(target.read, false);
  });

  await t.test('Notifications: Mark notification as read', async () => {
    const res = await request(app)
      .patch(`/api/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);

    const check = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${priyaToken}`);

    const target = check.body.notifications.find(n => n.id === notifId);
    assert.equal(target.read, true);
  });

  await t.test('Search Privacy: Verify search strictly enforces conversation boundaries', async () => {
    // 1. Post in public #projects
    const chRes = await request(app).get('/api/channels').set('Authorization', `Bearer ${priyaToken}`);
    const projectsCh = chRes.body.channels.find(c => c.name === 'projects');

    await request(app)
      .post(`/api/conversations/${projectsCh.conversation_id}/messages`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ content: 'Public discussion on project-supernova' });

    // 2. Create private channel for Priya only
    const privRes = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ name: 'supernova-private', type: 'PRIVATE' });

    await request(app)
      .post(`/api/conversations/${privRes.body.channel.conversationId}/messages`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ content: 'Confidential details about project-supernova' });

    // Priya searches 'supernova': finds BOTH
    const priyaSearch = await request(app)
      .get('/api/search?q=supernova')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(priyaSearch.status, 200);
    assert.equal(priyaSearch.body.messages.length, 2);

    // Agen searches 'supernova': finds ONLY the public one!
    const agenSearch = await request(app)
      .get('/api/search?q=supernova')
      .set('Authorization', `Bearer ${agenToken}`);

    assert.equal(agenSearch.status, 200);
    assert.equal(agenSearch.body.messages.length, 1);
    assert.equal(agenSearch.body.messages[0].channel_name, 'projects');

    // Admin searches 'supernova': CANNOT access Priya's private channel message!
    const adminSearch = await request(app)
      .get('/api/search?q=supernova')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(adminSearch.status, 200);
    assert.equal(adminSearch.body.messages.length, 1);
    assert.equal(adminSearch.body.messages[0].channel_name, 'projects');
  });

  await t.test('Admin: Dashboard metrics calculate from real database state', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.metrics.activeUsers >= 4);
    assert.ok(typeof res.body.metrics.pendingAccessRequests === 'number');
    assert.ok(typeof res.body.metrics.activeSessions === 'number');
    assert.equal(res.body.messages, undefined, 'Must not return message list');
  });

  await t.test('Admin: List users and manage account status', async () => {
    const usersRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(usersRes.status, 200);
    assert.ok(usersRes.body.users.length >= 4);

    // Admin suspends Agen
    const suspendRes = await request(app)
      .patch(`/api/admin/users/${agenId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SUSPENDED' });

    assert.equal(suspendRes.status, 200);
    assert.equal(suspendRes.body.user.status, 'SUSPENDED');

    // Agen's active session is now revoked
    const agenCheck = await request(app)
      .get('/api/auth/session')
      .set('Authorization', `Bearer ${agenToken}`);
    assert.equal(agenCheck.status, 401);
    assert.match(agenCheck.body.message, /revoked/i);

    // Agen attempts to log in: blocked with 403 Forbidden
    const loginAttempt = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'agen', password: 'NexusMember2026!' });
    assert.equal(loginAttempt.status, 403);
    assert.equal(loginAttempt.body.status, 'SUSPENDED');

    // Restore Agen to ACTIVE
    await request(app)
      .patch(`/api/admin/users/${agenId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    // Agen logs back in
    const reLogin = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'agen', password: 'NexusMember2026!' });
    assert.equal(reLogin.status, 200);
    agenToken = reLogin.body.token;
  });

  await t.test('Admin: Role management and self-protection', async () => {
    // Admin cannot remove own admin role
    const selfDemote = await request(app)
      .patch(`/api/admin/users/${adminLogin.body.user.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'MEMBER' });
    assert.equal(selfDemote.status, 400);

    // Admin promotes Priya to MODERATOR
    const promoteRes = await request(app)
      .patch(`/api/admin/users/${priyaId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'MODERATOR' });
    assert.equal(promoteRes.status, 200);
    assert.equal(promoteRes.body.user.role, 'MODERATOR');
  });

  await t.test('Admin: Inspect active sessions and revoke session', async () => {
    const sessionsRes = await request(app)
      .get('/api/admin/sessions')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(sessionsRes.status, 200);
    assert.ok(Array.isArray(sessionsRes.body.sessions));
    assert.ok(sessionsRes.body.sessions.length > 0);

    // Pick a non-admin session to revoke so admin token remains active
    const targetSession = sessionsRes.body.sessions.find(s => s.username !== 'admin') || sessionsRes.body.sessions[0];
    assert.equal(targetSession.token_hash, undefined, 'Must never expose token hash');

    // Revoke session
    const revokeRes = await request(app)
      .delete(`/api/admin/sessions/${targetSession.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(revokeRes.status, 200);
  });

  await t.test('Admin: Audit logs record actions without message content', async () => {
    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(auditRes.status, 200);
    assert.ok(auditRes.body.logs.length > 0);

    for (const log of auditRes.body.logs) {
      assert.equal(log.metadata?.content, undefined, 'Audit log must never store message body');
      assert.equal(log.metadata?.messageBody, undefined);
    }
  });

  await t.test('Moderation / Reports: Member submits report, Moderator reviews and actions it', async () => {
    // Re-authenticate Priya to ensure active session
    const pLogin = await request(app).post('/api/auth/login').send({ identifier: 'priya', password: 'NexusMember2026!' });
    const activePriyaToken = pLogin.body.token;

    // Priya posts a message in #general that will be reported
    const chRes = await request(app).get('/api/channels').set('Authorization', `Bearer ${activePriyaToken}`);
    const general = chRes.body.channels.find(c => c.name === 'general');

    const msgRes = await request(app)
      .post(`/api/conversations/${general.conversation_id}/messages`)
      .set('Authorization', `Bearer ${activePriyaToken}`)
      .send({ content: 'Spam promotional link reported here' });
    reportedMsgId = msgRes.body.message.id;

    // Agen reports the message
    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${agenToken}`)
      .send({
        messageId: reportedMsgId,
        reason: 'Unsolicited spam promotion'
      });

    assert.equal(reportRes.status, 201);
    reportId = reportRes.body.reportId;

    // Moderator views reports queue
    const queueRes = await request(app)
      .get('/api/reports/admin')
      .set('Authorization', `Bearer ${modToken}`);

    assert.equal(queueRes.status, 200);
    const targetReport = queueRes.body.reports.find(r => r.id === reportId);
    assert.ok(targetReport);
    assert.equal(targetReport.status, 'PENDING');

    // Moderator inspects report details
    const detailsRes = await request(app)
      .get(`/api/reports/admin/${reportId}`)
      .set('Authorization', `Bearer ${modToken}`);
    assert.equal(detailsRes.status, 200);
    assert.equal(detailsRes.body.report.message_content, 'Spam promotional link reported here');

    // Moderator actions the report and deletes message
    const actionRes = await request(app)
      .patch(`/api/reports/admin/${reportId}`)
      .set('Authorization', `Bearer ${modToken}`)
      .send({ status: 'ACTIONED', deleteMessage: true });

    assert.equal(actionRes.status, 200);
    assert.equal(actionRes.body.status, 'ACTIONED');

    // Verify reported message is now deleted
    const checkMsg = await query('SELECT deleted_at FROM messages WHERE id = $1', [reportedMsgId]);
    assert.ok(checkMsg.rows[0].deleted_at);
  });
});
