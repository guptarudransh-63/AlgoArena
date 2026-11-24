const { normalizeOutput, exactCompare, floatCompare, jsonCompare, compareOutputs } = require('../src/services/evaluation/comparators');
const evaluator = require('../src/services/evaluation/evaluator');
const { VERDICT } = require('../src/config/constants');

describe('Evaluation & Comparators', () => {
  describe('Output Comparators', () => {
    it('should normalize Windows CRLF to LF and trim line trailing whitespace', () => {
      const raw = 'line1   \r\nline2 \r\n\r\n';
      expect(normalizeOutput(raw)).toBe('line1\nline2');
    });

    it('should perform exact compare ignoring trailing whitespace and newlines', () => {
      expect(exactCompare('Hello World \n\n', 'Hello World')).toBe(true);
      expect(exactCompare('Hello\r\nWorld', 'Hello\nWorld')).toBe(true);
      expect(exactCompare('hello', 'Hello')).toBe(false);
    });

    it('should compare JSON arrays and objects regardless of spacing', () => {
      expect(jsonCompare('[0, 1]', '[0,1]')).toBe(true);
      expect(jsonCompare('{"a": 1, "b": 2}', '{"b":2,"a":1}')).toBe(false); // Order sensitive string fallback or key check
      expect(compareOutputs('[1, 2, 3]', '[1,2,3]')).toBe(true);
    });

    it('should compare floats within epsilon tolerance', () => {
      expect(floatCompare('3.141592', '3.141590', 1e-4)).toBe(true);
      expect(floatCompare('3.14', '3.15', 1e-3)).toBe(false);
    });
  });

  describe('Evaluator Engine with Mock Adapter', () => {
    const testCases = [
      { input: '1\n', expectedOutput: '1', isPublic: true },
      { input: '2\n', expectedOutput: '2', isPublic: false }
    ];

    it('should evaluate accepted code correctly', async () => {
      const res = await evaluator.evaluate({
        language: 'javascript',
        sourceCode: 'console.log("valid");',
        testCases,
        timeLimitMs: 2000,
        memoryLimitKb: 256000
      });

      expect(res.verdict).toBe(VERDICT.ACCEPTED);
      expect(res.testsPassed).toBe(2);
      expect(res.totalTests).toBe(2);
    });

    it('should handle simulated compilation errors', async () => {
      const res = await evaluator.evaluate({
        language: 'javascript',
        sourceCode: '// SIMULATE_CE\nvar a = ;',
        testCases,
        timeLimitMs: 2000,
        memoryLimitKb: 256000
      });

      expect(res.verdict).toBe(VERDICT.COMPILATION_ERROR);
    });

    it('should handle simulated time limit exceeded', async () => {
      const res = await evaluator.evaluate({
        language: 'javascript',
        sourceCode: '// SIMULATE_TLE\nwhile(true) {}',
        testCases,
        timeLimitMs: 2000,
        memoryLimitKb: 256000
      });

      expect(res.verdict).toBe(VERDICT.TIME_LIMIT_EXCEEDED);
    });

    it('should handle simulated wrong answer', async () => {
      const res = await evaluator.evaluate({
        language: 'javascript',
        sourceCode: '// SIMULATE_WA',
        testCases,
        timeLimitMs: 2000,
        memoryLimitKb: 256000
      });

      expect(res.verdict).toBe(VERDICT.WRONG_ANSWER);
    });
  });
});
