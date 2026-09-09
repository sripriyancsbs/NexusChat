import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('GET /api/health returns 200 and healthy status', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'NexusChat Backend API');
  assert.ok(response.body.timestamp);
});

test('GET /api returns 200 and metadata', async () => {
  const response = await request(app).get('/api');
  assert.equal(response.status, 200);
  assert.equal(response.body.name, 'NexusChat API');
});

test('GET /api/nonexistent returns 404', async () => {
  const response = await request(app).get('/api/nonexistent');
  assert.equal(response.status, 404);
  assert.equal(response.body.error, 'NotFound');
});
