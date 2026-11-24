const { getExecutionService } = require('../execution');
const { compareOutputs, normalizeOutput } = require('./comparators');
const { VERDICT } = require('../../config/constants');

class Evaluator {
  constructor() {
    this.executionService = getExecutionService();
  }

  /**
   * Evaluate code against a suite of test cases
   * @param {Object} params
   * @param {string} params.language
   * @param {string} params.sourceCode
   * @param {Array} params.testCases - array of TestCase documents/objects
   * @param {number} params.timeLimitMs
   * @param {number} params.memoryLimitKb
   * @param {string} params.type - 'run' (sample/custom test) or 'submit' (full evaluation)
   */
  async evaluate({ language, sourceCode, testCases, timeLimitMs, memoryLimitKb, type = 'submit' }) {
    const testResults = [];
    let finalVerdict = VERDICT.ACCEPTED;
    let testsPassed = 0;
    let maxRuntime = 0;
    let maxMemory = 0;
    let primaryError = null;

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];

      const execResult = await this.executionService.execute({
        language,
        sourceCode,
        stdin: tc.input,
        timeLimitMs,
        memoryLimitKb,
        expectedOutput: tc.expectedOutput
      });

      maxRuntime = Math.max(maxRuntime, execResult.runtimeMs || 0);
      maxMemory = Math.max(maxMemory, execResult.memoryKb || 0);

      let isPassed = false;
      let testVerdict = execResult.verdict;

      // Check if compilation error or runtime crash occurred
      if (execResult.verdict === VERDICT.COMPILATION_ERROR) {
        finalVerdict = VERDICT.COMPILATION_ERROR;
        primaryError = execResult.compileOutput || execResult.stderr || 'Compilation Error';
        testResults.push({
          testIndex: i,
          passed: false,
          isPublic: tc.isPublic,
          input: tc.isPublic ? tc.input : undefined,
          expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
          actualOutput: tc.isPublic ? execResult.stdout : undefined,
          stderr: execResult.stderr || execResult.compileOutput,
          runtime: execResult.runtimeMs,
          memory: execResult.memoryKb,
          verdict: VERDICT.COMPILATION_ERROR
        });
        // On compilation error, stop further evaluation immediately
        break;
      }

      if (execResult.verdict === VERDICT.TIME_LIMIT_EXCEEDED) {
        if (finalVerdict === VERDICT.ACCEPTED) finalVerdict = VERDICT.TIME_LIMIT_EXCEEDED;
        testResults.push({
          testIndex: i,
          passed: false,
          isPublic: tc.isPublic,
          input: tc.isPublic ? tc.input : undefined,
          expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
          actualOutput: tc.isPublic ? execResult.stdout : undefined,
          stderr: 'Time Limit Exceeded',
          runtime: execResult.runtimeMs,
          memory: execResult.memoryKb,
          verdict: VERDICT.TIME_LIMIT_EXCEEDED
        });
        if (type === 'submit') break;
        continue;
      }

      if (execResult.verdict === VERDICT.MEMORY_LIMIT_EXCEEDED) {
        if (finalVerdict === VERDICT.ACCEPTED) finalVerdict = VERDICT.MEMORY_LIMIT_EXCEEDED;
        testResults.push({
          testIndex: i,
          passed: false,
          isPublic: tc.isPublic,
          input: tc.isPublic ? tc.input : undefined,
          expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
          actualOutput: tc.isPublic ? execResult.stdout : undefined,
          stderr: 'Memory Limit Exceeded',
          runtime: execResult.runtimeMs,
          memory: execResult.memoryKb,
          verdict: VERDICT.MEMORY_LIMIT_EXCEEDED
        });
        if (type === 'submit') break;
        continue;
      }

      if (execResult.verdict === VERDICT.RUNTIME_ERROR) {
        if (finalVerdict === VERDICT.ACCEPTED) finalVerdict = VERDICT.RUNTIME_ERROR;
        primaryError = execResult.stderr || 'Runtime Error';
        testResults.push({
          testIndex: i,
          passed: false,
          isPublic: tc.isPublic,
          input: tc.isPublic ? tc.input : undefined,
          expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
          actualOutput: tc.isPublic ? execResult.stdout : undefined,
          stderr: execResult.stderr,
          runtime: execResult.runtimeMs,
          memory: execResult.memoryKb,
          verdict: VERDICT.RUNTIME_ERROR
        });
        if (type === 'submit') break;
        continue;
      }

      // Check output match
      const matched = compareOutputs(execResult.stdout, tc.expectedOutput);
      if (matched) {
        isPassed = true;
        testsPassed++;
        testVerdict = VERDICT.ACCEPTED;
      } else {
        isPassed = false;
        testVerdict = VERDICT.WRONG_ANSWER;
        if (finalVerdict === VERDICT.ACCEPTED) {
          finalVerdict = VERDICT.WRONG_ANSWER;
        }
      }

      testResults.push({
        testIndex: i,
        passed: isPassed,
        isPublic: tc.isPublic,
        input: tc.isPublic ? tc.input : undefined,
        expectedOutput: tc.isPublic ? tc.expectedOutput : undefined,
        actualOutput: tc.isPublic ? normalizeOutput(execResult.stdout) : undefined,
        stderr: execResult.stderr,
        runtime: execResult.runtimeMs,
        memory: execResult.memoryKb,
        verdict: testVerdict
      });

      // For official submissions, stop on first wrong answer to optimize worker throughput
      if (type === 'submit' && !isPassed) {
        break;
      }
    }

    return {
      verdict: finalVerdict,
      testsPassed,
      totalTests: testCases.length,
      evaluatedTests: testResults.length,
      runtime: maxRuntime,
      memory: maxMemory,
      error: primaryError,
      results: testResults
    };
  }
}

module.exports = new Evaluator();
