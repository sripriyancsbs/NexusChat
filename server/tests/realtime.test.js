import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import request from 'supertest';
import app from '../src/app.js';
import { server } from '../src/server.js';
import { initDb } from '../src/config/db.js';
import { seedDatabase } from '../src/db/seed.js';

test('Real-Time WebSocket Messaging and Privacy Boundary Suite', async (t) => {
  await initDb();
  await seedDatabase();

  if (!server.listening) {
    await new Promise((resolve) => server.listen(0, resolve));
  }
  const port = server.address().port;
  const wsUrl = `ws://127.0.0.1:${port}`;

  // Log in Priya
  const priyaLogin = await request(app).post('/api/auth/login').send({ identifier: 'priya', password: 'NexusMember2026!' });
  const priyaToken = priyaLogin.body.token;
  const priyaId = priyaLogin.body.user.id;

  // Log in Agen
  const agenLogin = await request(app).post('/api/auth/login').send({ identifier: 'agen', password: 'NexusMember2026!' });
  const agenToken = agenLogin.body.token;
  const agenId = agenLogin.body.user.id;

  // Log in Admin
  const adminLogin = await request(app).post('/api/auth/login').send({ identifier: 'admin', password: 'AdminSecure2026!' });
  const adminToken = adminLogin.body.token;

  // Create private DM between Priya and Agen
  const dmRes = await request(app)
    .post('/api/conversations/direct')
    .set('Authorization', `Bearer ${priyaToken}`)
    .send({ targetUserId: agenId });
  const dmConvId = dmRes.body.conversation.id;

  let priyaWs = null;
  let agenWs = null;
  let adminWs = null;

  const connectAndAuth = (token) => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'auth', token }));
      });
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'auth:success') {
          resolve(ws);
        } else if (msg.type === 'auth:error') {
          reject(new Error(msg.message));
        }
      });
      ws.on('error', reject);
    });
  };

  await t.test('Priya, Agen, and Admin successfully authenticate over WebSocket', async () => {
    priyaWs = await connectAndAuth(priyaToken);
    agenWs = await connectAndAuth(agenToken);
    adminWs = await connectAndAuth(adminToken);

    assert.equal(priyaWs.readyState, WebSocket.OPEN);
    assert.equal(agenWs.readyState, WebSocket.OPEN);
    assert.equal(adminWs.readyState, WebSocket.OPEN);
  });

  await t.test('Priya and Agen subscribe to their private DM conversation', async () => {
    const subscribeRoom = (ws, convId) => {
      return new Promise((resolve) => {
        const onMsg = (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'subscribed' && msg.conversationId === convId) {
            ws.removeListener('message', onMsg);
            resolve(msg);
          }
        };
        ws.on('message', onMsg);
        ws.send(JSON.stringify({ type: 'subscribe', conversationId: convId }));
      });
    };

    const priyaSub = await subscribeRoom(priyaWs, dmConvId);
    assert.equal(priyaSub.conversationId, dmConvId);

    const agenSub = await subscribeRoom(agenWs, dmConvId);
    assert.equal(agenSub.conversationId, dmConvId);
  });

  await t.test('Admin is REJECTED when attempting to subscribe to private DM conversation', async () => {
    const adminRejected = await new Promise((resolve) => {
      const onMsg = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'error' && msg.error === 'Forbidden') {
          adminWs.removeListener('message', onMsg);
          resolve(msg);
        }
      };
      adminWs.on('message', onMsg);
      adminWs.send(JSON.stringify({ type: 'subscribe', conversationId: dmConvId }));
    });

    assert.equal(adminRejected.error, 'Forbidden');
    assert.match(adminRejected.message, /unauthorized/i);
  });

  await t.test('Real-time message: Priya sends message, Agen receives it, Admin does NOT', async () => {
    let adminReceivedMessage = false;
    const adminListener = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'message:new' && msg.message?.conversation_id === dmConvId) {
        adminReceivedMessage = true;
      }
    };
    adminWs.on('message', adminListener);

    const agenReceivedPromise = new Promise((resolve) => {
      const onMsg = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'message:new' && msg.message?.conversation_id === dmConvId) {
          agenWs.removeListener('message', onMsg);
          resolve(msg);
        }
      };
      agenWs.on('message', onMsg);
    });

    // Priya posts message via REST
    await request(app)
      .post(`/api/conversations/${dmConvId}/messages`)
      .set('Authorization', `Bearer ${priyaToken}`)
      .send({ content: 'Real-time WebSocket transmission test!' });

    const agenReceived = await agenReceivedPromise;
    assert.equal(agenReceived.message.content, 'Real-time WebSocket transmission test!');

    // Verify Admin was NEVER sent the message
    assert.equal(adminReceivedMessage, false, 'Admin MUST NOT receive private message broadcast');
    adminWs.removeListener('message', adminListener);
  });

  await t.test('Typing indicator: Priya starts typing and Agen receives typing event', async () => {
    const typingPromise = new Promise((resolve) => {
      const onMsg = (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'typing:update' && msg.conversationId === dmConvId) {
          agenWs.removeListener('message', onMsg);
          resolve(msg);
        }
      };
      agenWs.on('message', onMsg);
    });

    priyaWs.send(JSON.stringify({ type: 'typing:start', conversationId: dmConvId }));
    const typingEvent = await typingPromise;

    assert.equal(typingEvent.isTyping, true);
    assert.equal(typingEvent.username, 'priya');
  });

  await t.test('Clean socket closure', async () => {
    priyaWs.close();
    agenWs.close();
    adminWs.close();
    await new Promise((resolve) => setTimeout(resolve, 50));
    await new Promise((resolve) => server.close(resolve));
  });
});
