const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const SubmissionTestResult = require('../models/SubmissionTestResult');
const ExecutionJob = require('../models/ExecutionJob');
const { getSubmissionQueue } = require('../queues/submissionQueue');
const { processSubmission } = require('../workers/submissionWorker');
const evaluator = require('../services/evaluation/evaluator');
const AppError = require('../utils/AppError');
const { SUBMISSION_STATUS, SUBMISSION_TYPE, USER_ROLE } = require('../config/constants');

class SubmissionService {
  /**
   * Run code against sample tests or custom input
   */
  async runCode(problemId, userId, { language, sourceCode, customInput }) {
    const problem = await Problem.findOne({ _id: problemId, isPublished: true });
    if (!problem) {
      throw new AppError('Problem not found or unpublished', 404);
    }

    let testCases = [];
    if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
      // Single custom input run
      testCases = [
        {
          input: customInput,
          expectedOutput: '', // User supplied custom input, evaluate stdout
          isPublic: true,
          order: 1
        }
      ];
    } else {
      // Public sample tests
      testCases = await TestCase.find({ problemId: problem._id, isPublic: true })
        .sort({ order: 1 })
        .lean();

      if (testCases.length === 0 && problem.examples?.length > 0) {
        testCases = problem.examples.map((ex, idx) => ({
          input: ex.input,
          expectedOutput: ex.output,
          isPublic: true,
          order: idx + 1
        }));
      }
    }

    if (testCases.length === 0) {
      throw new AppError('No test cases available for sample run', 400);
    }

    // Persist a 'run' submission record for history
    const submission = await Submission.create({
      userId,
      problemId: problem._id,
      problemVersion: problem.version,
      language,
      sourceCode,
      type: SUBMISSION_TYPE.RUN,
      status: SUBMISSION_STATUS.RUNNING,
      startedAt: new Date()
    });

    const evalResult = await evaluator.evaluate({
      language,
      sourceCode,
      testCases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      type: 'run'
    });

    submission.status = SUBMISSION_STATUS.COMPLETED;
    submission.verdict = evalResult.verdict;
    submission.runtime = evalResult.runtime;
    submission.memory = evalResult.memory;
    submission.testsPassed = evalResult.testsPassed;
    submission.totalTests = evalResult.totalTests;
    submission.error = evalResult.error;
    submission.completedAt = new Date();
    await submission.save();

    return {
      submissionId: submission._id,
      verdict: evalResult.verdict,
      runtime: evalResult.runtime,
      memory: evalResult.memory,
      testsPassed: evalResult.testsPassed,
      totalTests: evalResult.totalTests,
      error: evalResult.error,
      results: evalResult.results
    };
  }

  /**
   * Submit code for full evaluation through background queue
   */
  async submitCode(problemId, userId, { language, sourceCode }) {
    const problem = await Problem.findOne({ _id: problemId, isPublished: true });
    if (!problem) {
      throw new AppError('Problem not found or unpublished', 404);
    }

    // Check submission frequency rate limit per user
    const recentSubmissions = await Submission.countDocuments({
      userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 1000) } // last 30 seconds
    });

    if (recentSubmissions >= 5) {
      throw new AppError('You are submitting too frequently. Please wait a few seconds.', 429);
    }

    // 1. Create persistent submission record
    const submission = await Submission.create({
      userId,
      problemId: problem._id,
      problemVersion: problem.version,
      language,
      sourceCode,
      type: SUBMISSION_TYPE.SUBMIT,
      status: SUBMISSION_STATUS.QUEUED
    });

    // 2. Create execution job record
    const executionJob = await ExecutionJob.create({
      submissionId: submission._id,
      queueState: 'pending'
    });

    // 3. Enqueue to BullMQ
    let queuedToRedis = false;
    try {
      const queue = getSubmissionQueue();
      if (queue) {
        const job = await queue.add(
          'evaluate',
          { submissionId: submission._id.toString() },
          { jobId: submission._id.toString() }
        );
        executionJob.bullJobId = job.id;
        await executionJob.save();
        queuedToRedis = true;
      }
    } catch (err) {
      console.warn('[SubmissionService] Redis enqueue failed, falling back to direct async worker:', err.message);
    }

    // If Redis queue was not available, process asynchronously in background
    if (!queuedToRedis) {
      setImmediate(async () => {
        try {
          await processSubmission(submission._id);
        } catch (err) {
          console.error('[SubmissionService] Background direct execution failed:', err);
        }
      });
    }

    return {
      submissionId: submission._id,
      status: submission.status,
      message: 'Submission queued for evaluation'
    };
  }

  /**
   * Get single submission status (polling)
   */
  async getSubmissionStatus(submissionId, userId, userRole) {
    const submission = await Submission.findById(submissionId).select(
      'status verdict runtime memory testsPassed totalTests error createdAt startedAt completedAt userId problemId language'
    );

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Ownership check
    if (userRole !== USER_ROLE.ADMIN && submission.userId.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to view this submission', 403);
    }

    return submission;
  }

  /**
   * Get submission details including results
   */
  async getSubmissionById(submissionId, userId, userRole) {
    const submission = await Submission.findById(submissionId)
      .populate('problemId', 'title slug difficulty')
      .populate('userId', 'username displayName avatarUrl');

    if (!submission) {
      throw new AppError('Submission not found', 404);
    }

    // Authorization
    const isOwner = submission.userId._id.toString() === userId.toString();
    const isAdmin = userRole === USER_ROLE.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new AppError('You are not authorized to inspect this submission', 403);
    }

    // Fetch test results
    const results = await SubmissionTestResult.find({ submissionId: submission._id })
      .sort({ testIndex: 1 })
      .lean();

    return {
      ...submission.toObject(),
      testResults: results
    };
  }

  /**
   * Get current user's submissions for a problem
   */
  async getUserSubmissionsForProblem(problemId, userId, query) {
    const { page = 1, limit = 10 } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [submissions, total] = await Promise.all([
      Submission.find({ userId, problemId, type: 'submit' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('verdict status runtime memory language createdAt')
        .lean(),
      Submission.countDocuments({ userId, problemId, type: 'submit' })
    ]);

    return {
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get all submissions (with filters)
   */
  async getSubmissions(query, userId = null, userRole = null) {
    const {
      page = 1,
      limit = 20,
      problemId,
      language,
      verdict,
      username,
      mine
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { type: 'submit' };

    if (mine && userId) {
      filter.userId = userId;
    }

    if (problemId) {
      filter.problemId = problemId;
    }

    if (language) {
      filter.language = language;
    }

    if (verdict) {
      filter.verdict = verdict;
    }

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('problemId', 'title slug difficulty')
        .populate('userId', 'username displayName')
        .select('-sourceCode')
        .lean(),
      Submission.countDocuments(filter)
    ]);

    return {
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
}

module.exports = new SubmissionService();
