/**
 * Abstract interface for Execution Providers
 */
class ExecutionService {
  /**
   * Submit code for execution against a single test input
   * @param {Object} options
   * @param {string} options.language - Language key ('javascript', 'python', 'java', 'cpp')
   * @param {string} options.sourceCode - Complete source code
   * @param {string} options.stdin - Input provided on stdin
   * @param {number} options.timeLimitMs - Time limit in milliseconds
   * @param {number} options.memoryLimitKb - Memory limit in kilobytes
   * @param {string} [options.expectedOutput] - Optional expected output for judge comparison
   * @returns {Promise<ExecutionResult>}
   */
  async execute(options) {
    throw new Error('Method execute() must be implemented by subclass');
  }

  /**
   * Check health and connectivity of execution service
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    throw new Error('Method healthCheck() must be implemented by subclass');
  }
}

/**
 * @typedef {Object} ExecutionResult
 * @property {string} stdout - Program standard output
 * @property {string} stderr - Program standard error / compiler errors
 * @property {string} compileOutput - Compiler error message if applicable
 * @property {number} runtimeMs - Execution time in milliseconds
 * @property {number} memoryKb - Memory usage in kilobytes
 * @property {string} status - Standardized verdict status ('Accepted', 'Wrong Answer', 'Time Limit Exceeded', etc.)
 * @property {number} statusId - Provider status ID
 * @property {string} statusDescription - Raw status description from provider
 */

module.exports = ExecutionService;
