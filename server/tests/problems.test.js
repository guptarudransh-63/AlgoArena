const request = require('supertest');
const app = require('../src/app');
const Problem = require('../src/models/Problem');
const TestCase = require('../src/models/TestCase');

require('./setup');

describe('Problem Endpoints', () => {
  let adminCookie;
  let userCookie;
  let problemId;

  beforeEach(async () => {
    // Create admin user
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      username: 'adminuser',
      email: 'admin@test.com',
      password: 'AdminPassword123'
    });
    // Promote to admin in DB
    const User = require('../src/models/User');
    await User.findByIdAndUpdate(adminRes.body.data.user.id, { role: 'admin' });
    // Re-login to get admin token
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@test.com',
      password: 'AdminPassword123'
    });
    adminCookie = loginRes.headers['set-cookie'];

    // Create normal user
    const userRes = await request(app).post('/api/v1/auth/register').send({
      username: 'normaluser',
      email: 'normal@test.com',
      password: 'UserPassword123'
    });
    userCookie = userRes.headers['set-cookie'];

    // Seed a published problem with public and private test cases
    const problem = await Problem.create({
      title: 'Sample Problem',
      slug: 'sample-problem',
      description: 'A test problem statement',
      difficulty: 'Easy',
      tags: ['Arrays'],
      isPublished: true,
      timeLimitMs: 2000,
      memoryLimitKb: 256000
    });
    problemId = problem._id;

    await TestCase.create([
      { problemId, input: '1 2', expectedOutput: '3', isPublic: true, order: 1 },
      { problemId, input: '10 20', expectedOutput: '30', isPublic: false, order: 2 }
    ]);
  });

  it('should list published problems', async () => {
    const res = await request(app).get('/api/v1/problems');

    expect(res.status).toBe(200);
    expect(res.body.data.problems.length).toBe(1);
    expect(res.body.data.problems[0].title).toBe('Sample Problem');
  });

  it('should retrieve problem by slug without leaking private tests', async () => {
    const res = await request(app).get('/api/v1/problems/sample-problem');

    expect(res.status).toBe(200);
    expect(res.body.data.problem.title).toBe('Sample Problem');
    // Public test cases present
    expect(res.body.data.problem.sampleTestCases.length).toBe(1);
    expect(res.body.data.problem.sampleTestCases[0].input).toBe('1 2');
  });

  it('should never expose private test cases via test-samples endpoint', async () => {
    const res = await request(app).get('/api/v1/problems/sample-problem/test-samples');

    expect(res.status).toBe(200);
    expect(res.body.data.samples.length).toBe(1);
    expect(res.body.data.samples[0].input).toBe('1 2');
    // Ensure no private test case was returned
    const privateInSamples = res.body.data.samples.some((s) => s.input === '10 20');
    expect(privateInSamples).toBe(false);
  });

  it('should allow admin to create and publish a problem', async () => {
    const newProb = {
      title: 'Admin Created Problem',
      slug: 'admin-created-problem',
      description: 'Description of problem created by admin',
      difficulty: 'Medium',
      tags: ['Dynamic Programming'],
      starterTemplates: { javascript: 'function solve() {}' }
    };

    const createRes = await request(app)
      .post('/api/v1/admin/problems')
      .set('Cookie', adminCookie)
      .send(newProb);

    expect(createRes.status).toBe(201);
    const createdId = createRes.body.data.problem._id;

    // Add public test case
    await request(app)
      .post(`/api/v1/admin/problems/${createdId}/test-cases`)
      .set('Cookie', adminCookie)
      .send({ input: 'in1', expectedOutput: 'out1', isPublic: true });

    // Add private test case
    await request(app)
      .post(`/api/v1/admin/problems/${createdId}/test-cases`)
      .set('Cookie', adminCookie)
      .send({ input: 'in2', expectedOutput: 'out2', isPublic: false });

    // Publish problem
    const pubRes = await request(app)
      .post(`/api/v1/admin/problems/${createdId}/publish`)
      .set('Cookie', adminCookie);

    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.isPublished).toBe(true);
  });

  it('should prevent non-admin user from accessing admin endpoints', async () => {
    const res = await request(app)
      .post('/api/v1/admin/problems')
      .set('Cookie', userCookie)
      .send({ title: 'Hack attempt', slug: 'hack', description: 'hack', difficulty: 'Easy' });

    expect(res.status).toBe(403);
  });
});
