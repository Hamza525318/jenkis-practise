import request from 'supertest';
import app from '../src/server.js';

describe('API', () => {
  it('health ok', async () => {
    const r = await request(app).get('/health');
    expect(r.status).toBe(200);
    expect(r.body.ok).toBe(true);
  });
  it('sum works', async () => {
    const r = await request(app).get('/sum?a=2&b=5');
    expect(r.body.result).toBe(7);
  });
});
