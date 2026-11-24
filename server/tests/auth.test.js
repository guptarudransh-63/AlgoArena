const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

require('./setup');

describe('Auth Endpoints', () => {
  const testUser = {
    username: 'tester1',
    email: 'tester1@example.com',
    password: 'Password123'
  };

  it('should register a new user successfully', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.username).toBe('tester1');
    expect(res.body.data.user.email).toBe('tester1@example.com');
    expect(res.body.data.token).toBeDefined();

    // Check cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=/);

    // Verify user in DB
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).toBeTruthy();
  });

  it('should reject registration with duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    const res = await request(app).post('/api/v1/auth/register').send({
      ...testUser,
      username: 'otheruser'
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already exists/i);
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.username).toBe('tester1');
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123'
    });

    expect(res.status).toBe(401);
  });

  it('should access /me when authenticated via cookie', async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(testUser);
    const cookie = regRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.user.username).toBe('tester1');
  });

  it('should return 401 on /me when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});
