const ExecutionService = require('./ExecutionService');
const { VERDICT } = require('../../config/constants');

class MockAdapter extends ExecutionService {
  constructor() {
    super();
  }

  async execute({ language, sourceCode, stdin, timeLimitMs, memoryLimitKb, expectedOutput }) {
    // Simulate slight asynchronous processing delay
    await new Promise((resolve) => setTimeout(resolve, 80));

    // Check for simulated errors triggered by code keywords
    if (sourceCode.includes('// SIMULATE_CE') || sourceCode.includes('SyntaxError:')) {
      return {
        stdout: '',
        stderr: 'SyntaxError: Unexpected token',
        compileOutput: 'Compilation error: Failed to compile source code',
        runtimeMs: 12,
        memoryKb: 8120,
        verdict: VERDICT.COMPILATION_ERROR,
        statusId: 6,
        statusDescription: 'Compilation Error'
      };
    }

    if (sourceCode.includes('// SIMULATE_TLE') || sourceCode.includes('while(true)') || sourceCode.includes('while (true)')) {
      return {
        stdout: '',
        stderr: 'Time limit exceeded',
        compileOutput: '',
        runtimeMs: timeLimitMs || 2000,
        memoryKb: 32000,
        verdict: VERDICT.TIME_LIMIT_EXCEEDED,
        statusId: 5,
        statusDescription: 'Time Limit Exceeded'
      };
    }

    if (sourceCode.includes('// SIMULATE_MLE')) {
      return {
        stdout: '',
        stderr: 'Memory limit exceeded',
        compileOutput: '',
        runtimeMs: 150,
        memoryKb: (memoryLimitKb || 256000) + 1024,
        verdict: VERDICT.MEMORY_LIMIT_EXCEEDED,
        statusId: 8,
        statusDescription: 'Memory Limit Exceeded'
      };
    }

    if (sourceCode.includes('// SIMULATE_RE') || sourceCode.includes('throw new Error') || sourceCode.includes('raise Exception')) {
      return {
        stdout: '',
        stderr: 'Runtime error: index out of bounds or unhandled exception',
        compileOutput: '',
        runtimeMs: 25,
        memoryKb: 14200,
        verdict: VERDICT.RUNTIME_ERROR,
        statusId: 11,
        statusDescription: 'Runtime Error (NZEC)'
      };
    }

    if (sourceCode.includes('// SIMULATE_WA') || sourceCode.includes('return false') && expectedOutput && expectedOutput.includes('true')) {
      return {
        stdout: 'wrong_mock_output\n',
        stderr: '',
        compileOutput: '',
        runtimeMs: 38,
        memoryKb: 15200,
        verdict: VERDICT.WRONG_ANSWER,
        statusId: 4,
        statusDescription: 'Wrong Answer'
      };
    }

    // Default: Simulate valid program execution returning the expected output or input
    const stdout = expectedOutput !== undefined ? `${expectedOutput}\n` : (stdin ? `${stdin}\n` : 'Success\n');
    const runtimeMs = Math.floor(Math.random() * 40) + 20; // 20 - 60ms
    const memoryKb = Math.floor(Math.random() * 2000) + 14000; // ~14-16MB

    return {
      stdout,
      stderr: '',
      compileOutput: '',
      runtimeMs,
      memoryKb,
      verdict: VERDICT.ACCEPTED,
      statusId: 3,
      statusDescription: 'Accepted'
    };
  }

  async healthCheck() {
    return true;
  }
}

module.exports = MockAdapter;
