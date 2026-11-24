/**
 * Output comparison utilities for evaluating test cases
 */

/**
 * Normalize text: converts \r\n to \n, trims trailing whitespace from each line,
 * and strips trailing newlines.
 */
function normalizeOutput(text) {
  if (text === null || text === undefined) return '';
  return text
    .toString()
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

/**
 * Exact comparison with normalized whitespace
 */
function exactCompare(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);
  return normActual === normExpected;
}

/**
 * Float comparison with configurable epsilon tolerance
 */
function floatCompare(actual, expected, epsilon = 1e-5) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  const actualTokens = normActual.split(/\s+/);
  const expectedTokens = normExpected.split(/\s+/);

  if (actualTokens.length !== expectedTokens.length) {
    return false;
  }

  for (let i = 0; i < actualTokens.length; i++) {
    const actNum = parseFloat(actualTokens[i]);
    const expNum = parseFloat(expectedTokens[i]);

    if (!isNaN(actNum) && !isNaN(expNum)) {
      if (Math.abs(actNum - expNum) > epsilon) {
        return false;
      }
    } else if (actualTokens[i] !== expectedTokens[i]) {
      return false;
    }
  }

  return true;
}

/**
 * JSON comparison: parses JSON outputs and checks deep equality (useful for arrays/objects)
 */
function jsonCompare(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);

  try {
    const parsedActual = JSON.parse(normActual);
    const parsedExpected = JSON.parse(normExpected);
    return JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
  } catch {
    // Fall back to exact comparison if not valid JSON
    return normActual === normExpected;
  }
}

/**
 * Main compare function supporting multiple strategies
 */
function compareOutputs(actual, expected, strategy = 'exact', options = {}) {
  switch (strategy) {
    case 'float':
      return floatCompare(actual, expected, options.epsilon || 1e-5);
    case 'json':
      return jsonCompare(actual, expected);
    case 'exact':
    default:
      // Try JSON compare if expected looks like JSON array/object, else exact
      if (typeof expected === 'string' && (expected.trim().startsWith('[') || expected.trim().startsWith('{'))) {
        return jsonCompare(actual, expected);
      }
      return exactCompare(actual, expected);
  }
}

module.exports = {
  normalizeOutput,
  exactCompare,
  floatCompare,
  jsonCompare,
  compareOutputs
};
