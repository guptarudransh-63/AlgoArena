const DIFFICULTY = Object.freeze({
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard'
});

const DIFFICULTIES = Object.freeze(Object.values(DIFFICULTY));

const VERDICT = Object.freeze({
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  COMPILATION_ERROR: 'Compilation Error',
  RUNTIME_ERROR: 'Runtime Error',
  INTERNAL_ERROR: 'Internal Error'
});

const VERDICTS = Object.freeze(Object.values(VERDICT));

const SUBMISSION_STATUS = Object.freeze({
  QUEUED: 'queued',
  PROCESSING: 'processing',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
});

const SUBMISSION_STATUSES = Object.freeze(Object.values(SUBMISSION_STATUS));

const SUBMISSION_TYPE = Object.freeze({
  RUN: 'run',
  SUBMIT: 'submit'
});

const SUBMISSION_TYPES = Object.freeze(Object.values(SUBMISSION_TYPE));

const USER_ROLE = Object.freeze({
  USER: 'user',
  ADMIN: 'admin'
});

const USER_ROLES = Object.freeze(Object.values(USER_ROLE));

const USER_PROGRESS_STATUS = Object.freeze({
  UNSOLVED: 'unsolved',
  ATTEMPTED: 'attempted',
  SOLVED: 'solved'
});

const USER_PROGRESS_STATUSES = Object.freeze(Object.values(USER_PROGRESS_STATUS));

const QUEUE_STATE = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  STALLED: 'stalled'
});

const QUEUE_STATES = Object.freeze(Object.values(QUEUE_STATE));

const LANGUAGE_CONFIGS = Object.freeze({
  javascript: {
    judge0Id: 63,
    name: 'JavaScript (Node.js)',
    version: '12.14.0',
    monacoLanguage: 'javascript',
    extension: 'js',
    defaultTemplate: '/**\n * @return {void}\n */\nfunction solution() {\n  // Write your code here\n}\n'
  },
  python: {
    judge0Id: 71,
    name: 'Python 3',
    version: '3.8.1',
    monacoLanguage: 'python',
    extension: 'py',
    defaultTemplate: 'class Solution:\n    def solve(self):\n        # Write your code here\n        pass\n'
  },
  java: {
    judge0Id: 62,
    name: 'Java',
    version: 'OpenJDK 13.0.1',
    monacoLanguage: 'java',
    extension: 'java',
    defaultTemplate: 'class Solution {\n    public void solve() {\n        // Write your code here\n    }\n}\n'
  },
  cpp: {
    judge0Id: 54,
    name: 'C++ (GCC)',
    version: 'GCC 9.2.0',
    monacoLanguage: 'cpp',
    extension: 'cpp',
    defaultTemplate: '#include <iostream>\n#include <vector>\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your code here\n    }\n};\n'
  }
});

const SUPPORTED_LANGUAGE_KEYS = Object.freeze(Object.keys(LANGUAGE_CONFIGS));

const RESOURCE_LIMITS = Object.freeze({
  defaultTimeLimitMs: 2000,
  minTimeLimitMs: 500,
  maxTimeLimitMs: 30000,
  defaultMemoryLimitKb: 256000,
  minMemoryLimitKb: 16000,
  maxMemoryLimitKb: 512000,
  maxSourceCodeLength: 50000
});

const PROBLEM_TAGS = Object.freeze([
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Math',
  'Sorting',
  'Greedy',
  'Depth-First Search',
  'Binary Search',
  'Matrix',
  'Tree',
  'Breadth-First Search',
  'Bit Manipulation',
  'Two Pointers',
  'Prefix Sum',
  'Heap (Priority Queue)',
  'Binary Tree',
  'Simulation',
  'Stack',
  'Graph',
  'Sliding Window',
  'Design',
  'Backtracking',
  'Union Find',
  'Linked List',
  'Recursion',
  'Divide and Conquer',
  'Trie'
]);

module.exports = {
  DIFFICULTY,
  DIFFICULTIES,
  VERDICT,
  VERDICTS,
  SUBMISSION_STATUS,
  SUBMISSION_STATUSES,
  SUBMISSION_TYPE,
  SUBMISSION_TYPES,
  USER_ROLE,
  USER_ROLES,
  USER_PROGRESS_STATUS,
  USER_PROGRESS_STATUSES,
  QUEUE_STATE,
  QUEUE_STATES,
  LANGUAGE_CONFIGS,
  SUPPORTED_LANGUAGE_KEYS,
  RESOURCE_LIMITS,
  PROBLEM_TAGS
};
