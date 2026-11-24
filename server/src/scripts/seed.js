const mongoose = require('mongoose');
const config = require('../config');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const SubmissionTestResult = require('../models/SubmissionTestResult');
const UserProblemProgress = require('../models/UserProblemProgress');
const ExecutionJob = require('../models/ExecutionJob');

const usersData = require('../seeds/users.seed');
const problemsData = require('../seeds/problems.seed');
const testCasesData = require('../seeds/testcases.seed');

async function seedDatabase() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Problem.deleteMany({}),
    TestCase.deleteMany({}),
    Submission.deleteMany({}),
    SubmissionTestResult.deleteMany({}),
    UserProblemProgress.deleteMany({}),
    ExecutionJob.deleteMany({})
  ]);

  console.log('[Seed] Creating demo users...');
  const createdUsers = [];
  for (const u of usersData) {
    const user = await User.create({
      username: u.username,
      email: u.email,
      passwordHash: u.password,
      displayName: u.displayName,
      role: u.role,
      avatarUrl: u.avatarUrl
    });
    createdUsers.push(user);
    console.log(`  Created user: ${user.username} (${user.role})`);
  }

  console.log('[Seed] Creating problems and test cases...');
  let totalTestCases = 0;
  for (const prob of problemsData) {
    const problem = await Problem.create(prob);

    const tcList = testCasesData[prob.slug] || [];
    if (tcList.length > 0) {
      const docs = tcList.map((tc) => ({
        ...tc,
        problemId: problem._id
      }));
      await TestCase.insertMany(docs);
      totalTestCases += docs.length;
    }

    console.log(`  Created problem: ${problem.title} [${problem.difficulty}] with ${tcList.length} tests`);
  }

  // --------------------------------------------------------------------------
  // Seed Submissions & User Progress
  // --------------------------------------------------------------------------
  console.log('[Seed] Generating realistic submissions and progress stats...');

  const allProblems = await Problem.find({});
  const problemMap = {};
  allProblems.forEach((p) => {
    problemMap[p.slug] = p;
  });

  const adminUser = createdUsers.find((u) => u.username === 'admin');
  const johnUser = createdUsers.find((u) => u.username === 'johndoe');
  const alexUser = createdUsers.find((u) => u.username === 'alex_coder');

  // Days offset helper (0 = today, 1 = yesterday, etc.)
  const getDateDaysAgo = (daysAgo, hoursOffset = 14) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hoursOffset, Math.floor(Math.random() * 50), Math.floor(Math.random() * 50), 0);
    return d;
  };

  const sampleSubmissions = [
    // --- Admin activity over the past 5 days (Streak of 5 days) ---
    {
      user: adminUser,
      slug: 'two-sum',
      lang: 'javascript',
      verdict: 'Accepted',
      runtime: 48,
      memory: 12400,
      daysAgo: 4,
      code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}'
    },
    {
      user: adminUser,
      slug: 'valid-parentheses',
      lang: 'python',
      verdict: 'Accepted',
      runtime: 32,
      memory: 14200,
      daysAgo: 3,
      code: 'def isValid(s):\n    stack = []\n    m = {")": "(", "}": "{", "]": "["}\n    for c in s:\n        if c in m:\n            if not stack or stack.pop() != m[c]: return False\n        else:\n            stack.append(c)\n    return not stack'
    },
    {
      user: adminUser,
      slug: 'best-time-to-buy-and-sell-stock',
      lang: 'cpp',
      verdict: 'Accepted',
      runtime: 18,
      memory: 8600,
      daysAgo: 2,
      code: 'int maxProfit(vector<int>& prices) {\n    int minP = 1e9, maxP = 0;\n    for (int p : prices) {\n        minP = min(minP, p);\n        maxP = max(maxP, p - minP);\n    }\n    return maxP;\n}'
    },
    {
      user: adminUser,
      slug: 'maximum-subarray',
      lang: 'javascript',
      verdict: 'Accepted',
      runtime: 65,
      memory: 15300,
      daysAgo: 1,
      code: 'function maxSubArray(nums) {\n  let cur = nums[0], max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    max = Math.max(max, cur);\n  }\n  return max;\n}'
    },
    {
      user: adminUser,
      slug: 'coin-change',
      lang: 'javascript',
      verdict: 'Wrong Answer',
      runtime: 72,
      memory: 16100,
      daysAgo: 1,
      code: '// Greedy attempt - fails on certain coin denominations\nfunction coinChange(coins, amount) {\n  coins.sort((a,b) => b - a);\n  let count = 0;\n  for (let c of coins) {\n    count += Math.floor(amount / c);\n    amount %= c;\n  }\n  return amount === 0 ? count : -1;\n}'
    },
    {
      user: adminUser,
      slug: 'coin-change',
      lang: 'javascript',
      verdict: 'Accepted',
      runtime: 84,
      memory: 17200,
      daysAgo: 0,
      code: 'function coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (let c of coins) {\n      if (i - c >= 0) dp[i] = Math.min(dp[i], dp[i - c] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}'
    },
    {
      user: adminUser,
      slug: 'reverse-linked-list',
      lang: 'javascript',
      verdict: 'Accepted',
      runtime: 55,
      memory: 13100,
      daysAgo: 0,
      code: 'function reverseList(head) {\n  return head.reverse();\n}'
    },
    {
      user: adminUser,
      slug: 'trapping-rain-water',
      lang: 'javascript',
      verdict: 'Time Limit Exceeded',
      runtime: 2100,
      memory: 24000,
      daysAgo: 0,
      code: '// O(N^2) brute force solution\nfunction trap(height) {\n  let total = 0;\n  for (let i = 0; i < height.length; i++) {\n    let lMax = Math.max(...height.slice(0, i + 1));\n    let rMax = Math.max(...height.slice(i));\n    total += Math.min(lMax, rMax) - height[i];\n  }\n  return total;\n}'
    },

    // --- John Doe activity ---
    {
      user: johnUser,
      slug: 'two-sum',
      lang: 'python',
      verdict: 'Accepted',
      runtime: 42,
      memory: 14800,
      daysAgo: 3,
      code: 'def twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        if target - num in lookup:\n            return [lookup[target - num], i]\n        lookup[num] = i\n    return []'
    },
    {
      user: johnUser,
      slug: 'valid-palindrome',
      lang: 'javascript',
      verdict: 'Accepted',
      runtime: 60,
      memory: 13500,
      daysAgo: 2,
      code: 'function isPalindrome(s) {\n  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}'
    },
    {
      user: johnUser,
      slug: 'binary-search',
      lang: 'cpp',
      verdict: 'Accepted',
      runtime: 12,
      memory: 7200,
      daysAgo: 1,
      code: 'int search(vector<int>& nums, int target) {\n    int l = 0, r = nums.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (nums[m] == target) return m;\n        if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}'
    },
    {
      user: johnUser,
      slug: 'container-with-most-water',
      lang: 'python',
      verdict: 'Wrong Answer',
      runtime: 58,
      memory: 16200,
      daysAgo: 0,
      code: 'def maxArea(height):\n    return height[0] * len(height) # Buggy'
    },

    // --- Alex Coder activity ---
    {
      user: alexUser,
      slug: 'trapping-rain-water',
      lang: 'cpp',
      verdict: 'Accepted',
      runtime: 8,
      memory: 9800,
      daysAgo: 1,
      code: 'int trap(vector<int>& height) {\n    int l = 0, r = height.size() - 1, lMax = 0, rMax = 0, ans = 0;\n    while (l < r) {\n        if (height[l] < height[r]) {\n            if (height[l] >= lMax) lMax = height[l];\n            else ans += lMax - height[l];\n            l++;\n        } else {\n            if (height[r] >= rMax) rMax = height[r];\n            else ans += rMax - height[r];\n            r--;\n        }\n    }\n    return ans;\n}'
    },
    {
      user: alexUser,
      slug: 'climbing-stairs',
      lang: 'javascript',
      verdict: 'Accepted',
      runtime: 38,
      memory: 11900,
      daysAgo: 2,
      code: 'function climbStairs(n) {\n  let a = 1, b = 1;\n  for (let i = 2; i <= n; i++) {\n    const t = a + b; a = b; b = t;\n  }\n  return b;\n}'
    }
  ];

  let totalSubmissionsCount = 0;
  for (const s of sampleSubmissions) {
    const prob = problemMap[s.slug];
    if (!prob || !s.user) continue;

    const createdAt = getDateDaysAgo(s.daysAgo, Math.floor(Math.random() * 8) + 10);
    const tcCount = (testCasesData[s.slug] || []).length || 5;
    const testsPassed = s.verdict === 'Accepted' ? tcCount : Math.floor(tcCount / 2);

    const submissionDoc = await Submission.create({
      userId: s.user._id,
      problemId: prob._id,
      problemVersion: 1,
      language: s.lang,
      sourceCode: s.code,
      type: 'submit',
      status: 'completed',
      verdict: s.verdict,
      runtime: s.runtime,
      memory: s.memory,
      testsPassed,
      totalTests: tcCount,
      startedAt: createdAt,
      completedAt: new Date(createdAt.getTime() + s.runtime),
      createdAt,
      updatedAt: createdAt
    });

    totalSubmissionsCount++;

    // Create test results for submission
    const testResults = [];
    for (let i = 1; i <= tcCount; i++) {
      const isPassed = i <= testsPassed;
      testResults.push({
        submissionId: submissionDoc._id,
        testIndex: i,
        passed: isPassed,
        stdout: isPassed ? 'Test output verified' : 'Expected different output',
        stderr: '',
        runtime: Math.round(s.runtime / tcCount),
        memory: Math.round(s.memory / tcCount),
        statusId: isPassed ? 3 : 4,
        statusDescription: isPassed ? 'Accepted' : 'Wrong Answer'
      });
    }
    await SubmissionTestResult.insertMany(testResults);

    // Update or insert UserProblemProgress
    const existingProgress = await UserProblemProgress.findOne({
      userId: s.user._id,
      problemId: prob._id
    });

    if (s.verdict === 'Accepted') {
      if (!existingProgress) {
        await UserProblemProgress.create({
          userId: s.user._id,
          problemId: prob._id,
          status: 'solved',
          firstAcceptedSubmissionId: submissionDoc._id,
          lastAttemptedAt: createdAt
        });
      } else if (existingProgress.status !== 'solved') {
        existingProgress.status = 'solved';
        existingProgress.firstAcceptedSubmissionId = submissionDoc._id;
        existingProgress.lastAttemptedAt = createdAt;
        await existingProgress.save();
      }
    } else {
      if (!existingProgress) {
        await UserProblemProgress.create({
          userId: s.user._id,
          problemId: prob._id,
          status: 'attempted',
          lastAttemptedAt: createdAt
        });
      }
    }
  }

  console.log(`  Created ${totalSubmissionsCount} demo submissions with test results & progress records`);

  console.log('\n========================================');
  console.log(' [Seed] Database Seeding Complete!');
  console.log(` - Users created: ${createdUsers.length}`);
  console.log(` - Problems created: ${problemsData.length}`);
  console.log(` - Test Cases created: ${totalTestCases}`);
  console.log(' Demo credentials:');
  console.log('   Admin: admin@algoarena.com / Admin@Password123');
  console.log('   User:  john@example.com / User@Password123');
  console.log('========================================\n');

  await mongoose.disconnect();
  console.log('[Seed] Disconnected from MongoDB');
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
