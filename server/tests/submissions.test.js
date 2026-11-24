const request = require('supertest');
const app = require('../src/app');
const Problem = require('../src/models/Problem');
const TestCase = require('../src/models/TestCase');
const UserProblemProgress = require('../src/models/UserProblemProgress');
const { VERDICT, USER_PROGRESS_STATUS } = require('../src/config/constants');

require('./setup');

describe('Submission Pipeline Endpoints', () => {
  let userCookie;
  let otherUserCookie;
  let problemId;

  beforeEach(async () => {
    const userRes = await request(app).post('/api/v1/auth/register').send({
      username: 'coder1',
      email: 'coder1@test.com',
      password: 'CoderPassword123'
    });
    userCookie = userRes.headers['set-cookie'];

    const otherRes = await request(app).post('/api/v1/auth/register').send({
      username: 'coder2',
      email: 'coder2@test.com',
      password: 'CoderPassword123'
    });
    otherUserCookie = otherRes.headers['set-cookie'];

    const problem = await Problem.create({
      title: 'Sum Problem',
      slug: 'sum-problem',
      description: 'Add two numbers',
      difficulty: 'Easy',
      tags: ['Mathematics'],
      isPublished: true,
      timeLimitMs: 2000,
      memoryLimitKb: 256000
    });
    problemId = problem._id;

    await TestCase.create([
      { problemId, input: '1 2', expectedOutput: '3', isPublic: true, order: 1 },
      { problemId, input: '5 5', expectedOutput: '10', isPublic: false, order: 2 }
    ]);
  });

  it('should run sample test cases synchronously via /run', async () => {
    const res = await request(app)
      .post(`/api/v1/problems/${problemId}/run`)
      .set('Cookie', userCookie)
      .send({
        language: 'javascript',
        sourceCode: 'console.log("3");'
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.verdict).toBe(VERDICT.ACCEPTED);
    expect(res.body.data.results.length).toBe(1);
    expect(res.body.data.results[0].passed).toBe(true);
  });

  it('should submit code, enqueue, process, and record Accepted verdict', async () => {
    const res = await request(app)
      .post(`/api/v1/problems/${problemId}/submit`)
      .set('Cookie', userCookie)
      .send({
        language: 'javascript',
        sourceCode: 'console.log("valid code");'
      });

    expect(res.status).toBe(202);
    expect(res.body.data.submissionId).toBeDefined();

    const submissionId = res.body.data.submissionId;

    // Allow background worker / setImmediate to process
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Poll status
    const statusRes = await request(app)
      .get(`/api/v1/submissions/${submissionId}/status`)
      .set('Cookie', userCookie);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.submission.verdict).toBe(VERDICT.ACCEPTED);

    // Verify progress updated
    const progress = await UserProblemProgress.findOne({ problemId });
    expect(progress).toBeTruthy();
    expect(progress.status).toBe(USER_PROGRESS_STATUS.SOLVED);
  });

  it('should prevent user from inspecting another user submission', async () => {
    const subRes = await request(app)
      .post(`/api/v1/problems/${problemId}/submit`)
      .set('Cookie', userCookie)
      .send({
        language: 'javascript',
        sourceCode: 'console.log("code");'
      });

    const submissionId = subRes.body.data.submissionId;

    // Other user attempts to fetch details
    const res = await request(app)
      .get(`/api/v1/submissions/${submissionId}`)
      .set('Cookie', otherUserCookie);

    expect(res.status).toBe(403);
  });
});
