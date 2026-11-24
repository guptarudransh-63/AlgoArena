const { Worker } = require('bullmq');
const { createRedisClient } = require('../config/redis');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const SubmissionTestResult = require('../models/SubmissionTestResult');
const UserProblemProgress = require('../models/UserProblemProgress');
const ExecutionJob = require('../models/ExecutionJob');
const evaluator = require('../services/evaluation/evaluator');
const { SUBMISSION_STATUS, VERDICT, USER_PROGRESS_STATUS } = require('../config/constants');
const { emitSubmissionStatus } = require('../socket');

/**
 * Process a single submission job
 * @param {Object} job - BullMQ job object or direct payload
 */
async function processSubmission(submissionId) {
  // 1. Fetch submission record atomically checking status
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  // Idempotency: if already completed or running elsewhere, don't re-run
  if (submission.status === SUBMISSION_STATUS.COMPLETED || submission.status === SUBMISSION_STATUS.FAILED) {
    return submission;
  }

  // 2. Mark submission as processing
  submission.status = SUBMISSION_STATUS.PROCESSING;
  submission.startedAt = new Date();
  await submission.save();

  // Notify listeners
  emitSubmissionStatus(submission.userId.toString(), submissionId.toString(), {
    status: SUBMISSION_STATUS.PROCESSING
  });

  await ExecutionJob.findOneAndUpdate(
    { submissionId },
    { $inc: { attemptCount: 1 }, queueState: 'active', updatedAt: new Date() }
  );

  try {
    // 3. Load authoritative problem
    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      throw new Error(`Problem ${submission.problemId} not found`);
    }

    // 4. Select test cases
    let testCases;
    if (submission.type === 'run') {
      // Sample public tests only
      testCases = await TestCase.find({ problemId: problem._id, isPublic: true })
        .sort({ order: 1 })
        .lean();

      // If problem has no public test cases in DB, use examples
      if (testCases.length === 0 && problem.examples && problem.examples.length > 0) {
        testCases = problem.examples.map((ex, idx) => ({
          input: ex.input,
          expectedOutput: ex.output,
          isPublic: true,
          order: idx + 1
        }));
      }
    } else {
      // Full evaluation with all test cases (public + private)
      testCases = await TestCase.find({ problemId: problem._id })
        .sort({ order: 1 })
        .lean();
    }

    if (testCases.length === 0) {
      throw new Error('No test cases available for evaluation');
    }

    // 5. Update state to RUNNING
    submission.status = SUBMISSION_STATUS.RUNNING;
    await submission.save();

    emitSubmissionStatus(submission.userId.toString(), submissionId.toString(), {
      status: SUBMISSION_STATUS.RUNNING
    });

    // 6. Execute evaluation
    const evalResult = await evaluator.evaluate({
      language: submission.language,
      sourceCode: submission.sourceCode,
      testCases,
      timeLimitMs: problem.timeLimitMs,
      memoryLimitKb: problem.memoryLimitKb,
      type: submission.type
    });

    // 7. Persist individual test case results
    if (evalResult.results && evalResult.results.length > 0) {
      const resultDocs = evalResult.results.map((r) => ({
        submissionId: submission._id,
        testIndex: r.testIndex,
        passed: r.passed,
        stdout: r.actualOutput || '',
        stderr: r.stderr || '',
        runtime: r.runtime || 0,
        memory: r.memory || 0,
        statusDescription: r.verdict
      }));

      // Use bulkWrite or insertMany with ordered: false
      try {
        await SubmissionTestResult.insertMany(resultDocs, { ordered: false });
      } catch (err) {
        // Continue if duplicate key
      }
    }

    // 8. Finalize submission record
    submission.status = SUBMISSION_STATUS.COMPLETED;
    submission.verdict = evalResult.verdict;
    submission.runtime = evalResult.runtime;
    submission.memory = evalResult.memory;
    submission.testsPassed = evalResult.testsPassed;
    submission.totalTests = evalResult.totalTests;
    submission.error = evalResult.error;
    submission.completedAt = new Date();
    await submission.save();

    // 9. Update UserProblemProgress if this was a full submission (not just a custom run)
    if (submission.type === 'submit') {
      const existingProgress = await UserProblemProgress.findOne({
        userId: submission.userId,
        problemId: submission.problemId
      });

      if (evalResult.verdict === VERDICT.ACCEPTED) {
        if (!existingProgress) {
          await UserProblemProgress.create({
            userId: submission.userId,
            problemId: submission.problemId,
            status: USER_PROGRESS_STATUS.SOLVED,
            firstAcceptedSubmissionId: submission._id,
            lastAttemptedAt: new Date()
          });
        } else {
          existingProgress.status = USER_PROGRESS_STATUS.SOLVED;
          if (!existingProgress.firstAcceptedSubmissionId) {
            existingProgress.firstAcceptedSubmissionId = submission._id;
          }
          existingProgress.lastAttemptedAt = new Date();
          await existingProgress.save();
        }
      } else {
        // Non-accepted submission
        if (!existingProgress) {
          await UserProblemProgress.create({
            userId: submission.userId,
            problemId: submission.problemId,
            status: USER_PROGRESS_STATUS.ATTEMPTED,
            lastAttemptedAt: new Date()
          });
        } else if (existingProgress.status !== USER_PROGRESS_STATUS.SOLVED) {
          existingProgress.status = USER_PROGRESS_STATUS.ATTEMPTED;
          existingProgress.lastAttemptedAt = new Date();
          await existingProgress.save();
        }
      }
    }

    // 10. Update execution job
    await ExecutionJob.findOneAndUpdate(
      { submissionId },
      { queueState: 'completed', updatedAt: new Date() }
    );

    // 11. Emit completion socket event
    emitSubmissionStatus(submission.userId.toString(), submissionId.toString(), {
      status: SUBMISSION_STATUS.COMPLETED,
      verdict: submission.verdict,
      runtime: submission.runtime,
      memory: submission.memory,
      testsPassed: submission.testsPassed,
      totalTests: submission.totalTests
    });

    return submission;
  } catch (err) {
    console.error(`[Worker] Error processing submission ${submissionId}:`, err);

    submission.status = SUBMISSION_STATUS.FAILED;
    submission.verdict = VERDICT.INTERNAL_ERROR;
    submission.error = err.message || 'Internal Judge Processing Error';
    submission.completedAt = new Date();
    await submission.save();

    await ExecutionJob.findOneAndUpdate(
      { submissionId },
      { queueState: 'failed', lastError: err.message, updatedAt: new Date() }
    );

    emitSubmissionStatus(submission.userId.toString(), submissionId.toString(), {
      status: SUBMISSION_STATUS.FAILED,
      verdict: VERDICT.INTERNAL_ERROR,
      error: submission.error
    });

    throw err;
  }
}

let workerInstance = null;

function startSubmissionWorker() {
  if (workerInstance) return workerInstance;

  try {
    const connection = createRedisClient({ lazyConnect: false });

    workerInstance = new Worker(
      'submissions',
      async (job) => {
        const { submissionId } = job.data;
        return await processSubmission(submissionId);
      },
      {
        connection,
        concurrency: 5
      }
    );

    workerInstance.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} (Submission ${job.data.submissionId}) completed`);
    });

    workerInstance.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job ? job.id : 'unknown'} failed:`, err.message);
    });

    workerInstance.on('error', (err) => {
      console.warn('[Worker] Warning:', err.message);
    });

    return workerInstance;
  } catch (err) {
    console.warn('[Worker] Could not connect BullMQ worker to Redis:', err.message);
    return null;
  }
}

module.exports = {
  processSubmission,
  startSubmissionWorker
};
