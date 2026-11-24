const axios = require('axios');
const ExecutionService = require('./ExecutionService');
const { LANGUAGE_CONFIGS, VERDICT } = require('../../config/constants');
const config = require('../../config');

class Judge0Adapter extends ExecutionService {
  constructor() {
    super();
    this.baseUrl = config.judge0.baseUrl.replace(/\/$/, '');
    this.apiKey = config.judge0.apiKey;
    this.apiHost = config.judge0.apiHost;

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      // RapidAPI headers or direct x-auth-token
      if (this.baseUrl.includes('rapidapi.com')) {
        headers['x-rapidapi-key'] = this.apiKey;
        headers['x-rapidapi-host'] = this.apiHost;
      } else {
        headers['X-Auth-Token'] = this.apiKey;
      }
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers,
      timeout: 20000
    });
  }

  encodeBase64(str) {
    if (!str) return '';
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  decodeBase64(str) {
    if (!str) return '';
    try {
      return Buffer.from(str, 'base64').toString('utf-8');
    } catch {
      return str;
    }
  }

  mapStatusIdToVerdict(statusId) {
    switch (statusId) {
      case 3:
        return VERDICT.ACCEPTED;
      case 4:
        return VERDICT.WRONG_ANSWER;
      case 5:
        return VERDICT.TIME_LIMIT_EXCEEDED;
      case 6:
        return VERDICT.COMPILATION_ERROR;
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return VERDICT.RUNTIME_ERROR;
      case 13:
      case 14:
      default:
        return VERDICT.INTERNAL_ERROR;
    }
  }

  async execute({ language, sourceCode, stdin, timeLimitMs, memoryLimitKb, expectedOutput }) {
    const langConfig = LANGUAGE_CONFIGS[language];
    if (!langConfig || !langConfig.judge0Id) {
      throw new Error(`Unsupported language for Judge0: ${language}`);
    }

    const payload = {
      language_id: langConfig.judge0Id,
      source_code: this.encodeBase64(sourceCode),
      stdin: this.encodeBase64(stdin || ''),
      cpu_time_limit: timeLimitMs ? (timeLimitMs / 1000).toFixed(2) : 2.0,
      memory_limit: memoryLimitKb || 256000
    };

    if (expectedOutput !== undefined) {
      payload.expected_output = this.encodeBase64(expectedOutput);
    }

    try {
      // Submit with wait=true for fast response
      const response = await this.client.post('/submissions?base64_encoded=true&wait=true', payload);
      let result = response.data;

      // If status is queued or processing, poll for completion
      if (result.status && (result.status.id === 1 || result.status.id === 2)) {
        result = await this.pollSubmission(result.token);
      }

      const stdout = this.decodeBase64(result.stdout || '');
      const stderr = this.decodeBase64(result.stderr || '');
      const compileOutput = this.decodeBase64(result.compile_output || '');

      const statusId = result.status ? result.status.id : 13;
      const verdict = this.mapStatusIdToVerdict(statusId);

      const runtimeMs = result.time ? Math.round(parseFloat(result.time) * 1000) : 0;
      const memoryKb = result.memory ? parseInt(result.memory, 10) : 0;

      // Limit captured output to safe size (50KB max)
      const maxOutputLen = 50000;
      return {
        stdout: stdout.slice(0, maxOutputLen),
        stderr: stderr.slice(0, maxOutputLen),
        compileOutput: compileOutput.slice(0, maxOutputLen),
        runtimeMs,
        memoryKb,
        verdict,
        statusId,
        statusDescription: result.status ? result.status.description : 'Unknown'
      };
    } catch (err) {
      // If network error or timeout
      const errMsg = err.response && err.response.data ? JSON.stringify(err.response.data) : err.message;
      return {
        stdout: '',
        stderr: `Execution service error: ${errMsg}`,
        compileOutput: '',
        runtimeMs: 0,
        memoryKb: 0,
        verdict: VERDICT.INTERNAL_ERROR,
        statusId: 13,
        statusDescription: 'Internal Judge Error'
      };
    }
  }

  async pollSubmission(token, maxAttempts = 15, delayMs = 1000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      const res = await this.client.get(`/submissions/${token}?base64_encoded=true`);
      if (res.data.status && res.data.status.id > 2) {
        return res.data;
      }
    }
    throw new Error('Judge0 submission polling timed out');
  }

  async healthCheck() {
    try {
      const res = await this.client.get('/about');
      return res.status === 200;
    } catch {
      return false;
    }
  }
}

module.exports = Judge0Adapter;
