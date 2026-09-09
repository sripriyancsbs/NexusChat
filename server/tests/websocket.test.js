import test from 'node:test';
import assert from 'node:assert/strict';
import { WebSocket } from 'ws';
import { server } from '../src/server.js';

test('WebSocket server accepts connection and handles ping/pong handshake', async () => {
  // Wait for server to listen if not already listening
  if (!server.listening) {
    await new Promise((resolve) => server.listen(0, resolve));
  }
  
  const port = server.address().port;
  const wsUrl = `ws://127.0.0.1:${port}`;

  const ws = new WebSocket(wsUrl);

  const openPromise = new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });

  await openPromise;
  assert.equal(ws.readyState, WebSocket.OPEN);

  const pongPromise = new Promise((resolve) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'pong') {
        resolve(msg);
      }
    });
  });

  ws.send(JSON.stringify({ type: 'ping' }));
  const response = await pongPromise;

  assert.equal(response.type, 'pong');
  assert.ok(response.timestamp);

  ws.close();
  await new Promise((resolve) => ws.on('close', resolve));
  assert.equal(ws.readyState, WebSocket.CLOSED);

  await new Promise((resolve) => server.close(resolve));
});
