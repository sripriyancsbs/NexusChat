import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { initDb, query } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';

test('Messaging, Channels, and Privacy Boundary Integration Suite', async (t) => {
  await initDb();
  await seedDatabase();

  // 1. Authenticate Priya (Member 1)
  const priyaLogin = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'priya', password: 'NexusMember2026!' });
  const priyaToken = priyaLogin.body.token;
  const priyaId = priyaLogin.body.user.id;

  // 2. Authenticate Agen (Member 2)
  const agenLogin = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'agen', password: 'NexusMember2026!' });
  const agenToken = agenLogin.body.token;
  const agenId = agenLogin.body.user.id;

  // 3. Authenticate Admin
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'admin', password: 'AdminSecure2026!' });
  const adminToken = adminLogin.body.token;

  let generalConvId = '';
  let privateChannelId = '';
  let privateConvId = '';
  let dmConvId = '';
  let priyaMsgId = '';

  await t.test('GET /api/channels lists seeded public channels', async () => {
    const res = await request(app)
      .get('/api/channels')
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.channels));
    const general = res.body.channels.find(c => c.name === 'general');
    assert.ok(general);
    assert.equal(general.type, 'PUBLIC');
    generalConvId = general.conversation_id;
  });

  await t.test('Priya posts a message to #general', async () => {
    const res = await request(app)
      .post(`/api/conversations/${generalConvId}/messages`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ content: 'Hello everyone in #general!' });

    assert.equal(res.status, 201);
    assert.equal(res.body.message.content, 'Hello everyone in #general!');
    assert.equal(res.body.message.sender_username, 'priya');
  });

  await t.test('Priya creates a PRIVATE channel', async () => {
    const res = await request(app)
      .post('/api/channels')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({
        name: 'priya-secret-lab',
        description: 'Private research discussion',
        type: 'PRIVATE'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.channel.type, 'PRIVATE');
    privateChannelId = res.body.channel.id;
    privateConvId = res.body.channel.conversationId;
  });

  await t.test('Agen (non-member) is FORBIDDEN from accessing Priya private channel', async () => {
    const res = await request(app)
      .get(`/api/channels/${privateChannelId}`)
      .set('Authorization', `Bearer ${agenToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Forbidden');
  });

  await t.test('Agen is FORBIDDEN from reading or posting to Priya private channel messages', async () => {
    const readRes = await request(app)
      .get(`/api/conversations/${privateConvId}/messages`)
      .set('Authorization', `Bearer ${agenToken}`);
    assert.equal(readRes.status, 403);

    const postRes = await request(app)
      .post(`/api/conversations/${privateConvId}/messages`)
      .set('Authorization', `Bearer ${agenToken}`)
      .send({ content: 'I should not be able to post here!' });
    assert.equal(postRes.status, 403);
  });

  await t.test('Priya starts a DIRECT MESSAGE with Agen', async () => {
    const res = await request(app)
      .post('/api/conversations/direct')
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ targetUserId: agenId });

    assert.equal(res.status, 201);
    assert.equal(res.body.conversation.type, 'DIRECT');
    assert.equal(res.body.conversation.targetUser.username, 'agen');
    dmConvId = res.body.conversation.id;
  });

  await t.test('Priya sends a private DM to Agen', async () => {
    const res = await request(app)
      .post(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ content: 'Hey Agen, this is our confidential 1-on-1 DM.' });

    assert.equal(res.status, 201);
    assert.equal(res.body.message.content, 'Hey Agen, this is our confidential 1-on-1 DM.');
    priyaMsgId = res.body.message.id;
  });

  await t.test('Agen can read the private DM from Priya', async () => {
    const res = await request(app)
      .get(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${agenToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.messages.length, 1);
    assert.equal(res.body.messages[0].content, 'Hey Agen, this is our confidential 1-on-1 DM.');
  });

  await t.test('CRITICAL PRIVACY CHECK: Admin CANNOT view or access Priya and Agen private DM', async () => {
    const res = await request(app)
      .get(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Forbidden');
    assert.match(res.body.message, /not authorized/i);
  });

  await t.test('Priya edits her own message and indicator shows updated', async () => {
    const res = await request(app)
      .put(`/api/messages/${priyaMsgId}`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ content: 'Hey Agen, this is our confidential 1-on-1 DM (edited).' });

    assert.equal(res.status, 200);
    assert.equal(res.body.message.content, 'Hey Agen, this is our confidential 1-on-1 DM (edited).');
    assert.ok(res.body.message.updatedAt);
  });

  await t.test('Agen CANNOT edit Priya message', async () => {
    const res = await request(app)
      .put(`/api/messages/${priyaMsgId}`)
      .set('Authorization', `Bearer ${agenToken}`)
      .send({ content: 'Malicious modification attempt' });

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Forbidden');
  });

  await t.test('Reactions: Agen reacts to Priya message', async () => {
    const addRes = await request(app)
      .post(`/api/messages/${priyaMsgId}/reactions`)
      .set('Authorization', `Bearer ${agenToken}`)
      .send({ reaction: '👍' });

    assert.equal(addRes.status, 201);
    assert.equal(addRes.body.action, 'ADDED');

    // Remove reaction
    const removeRes = await request(app)
      .post(`/api/messages/${priyaMsgId}/reactions`)
      .set('Authorization', `Bearer ${agenToken}`)
      .send({ reaction: '👍' });

    assert.equal(removeRes.status, 200);
    assert.equal(removeRes.body.action, 'REMOVED');
  });

  await t.test('Pinning: Priya pins the message', async () => {
    const pinRes = await request(app)
      .post(`/api/messages/${priyaMsgId}/pin`)
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(pinRes.status, 200);
    assert.equal(pinRes.body.isPinned, true);
  });

  await t.test('Threads: Agen replies to Priya message', async () => {
    const replyRes = await request(app)
      .post(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${agenToken}`)
      .send({
        content: 'Acknowledged! Sounds great.',
        replyToMessageId: priyaMsgId
      });

    assert.equal(replyRes.status, 201);
    assert.equal(replyRes.body.message.reply_to_message_id, priyaMsgId);

    // Verify reply count in parent message
    const msgCheck = await request(app)
      .get(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${priyaToken}`);

    const parent = msgCheck.body.messages.find(m => m.id === priyaMsgId);
    assert.equal(parseInt(parent.reply_count, 10), 1);
  });

  await t.test('Priya soft-deletes her message', async () => {
    const delRes = await request(app)
      .delete(`/api/messages/${priyaMsgId}`)
      .set('Authorization', `Bearer ${priyaToken}`);

    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.success, true);

    // Verify deleted content displays masked string
    const fetchRes = await request(app)
      .get(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${agenToken}`);

    const deletedMsg = fetchRes.body.messages.find(m => m.id === priyaMsgId);
    assert.equal(deletedMsg.content, 'This message was deleted.');
    assert.ok(deletedMsg.deleted_at);
  });
});
