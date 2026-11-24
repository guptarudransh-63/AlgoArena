const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const config = require('../config');

class AdminService {
  async getAllProblemsAdmin(query) {
    const { page = 1, limit = 20, search } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Problem.countDocuments(filter)
    ]);

    // Attach test case counts
    const problemIds = problems.map((p) => p._id);
    const testCounts = await TestCase.aggregate([
      { $match: { problemId: { $in: problemIds } } },
      {
        $group: {
          _id: '$problemId',
          totalTests: { $sum: 1 },
          publicTests: { $sum: { $cond: ['$isPublic', 1, 0] } },
          privateTests: { $sum: { $cond: ['$isPublic', 0, 1] } }
        }
      }
    ]);

    const countMap = new Map();
    testCounts.forEach((tc) => countMap.set(tc._id.toString(), tc));

    const enriched = problems.map((p) => ({
      ...p,
      testStats: countMap.get(p._id.toString()) || { totalTests: 0, publicTests: 0, privateTests: 0 }
    }));

    return {
      problems: enriched,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getProblemByIdAdmin(id) {
    const problem = await Problem.findById(id).lean();
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const testCases = await TestCase.find({ problemId: id }).sort({ order: 1 }).lean();

    return {
      ...problem,
      testCases
    };
  }

  async createProblem(data) {
    const existing = await Problem.findOne({ slug: data.slug });
    if (existing) {
      throw new AppError('A problem with this slug already exists', 409);
    }

    const problem = await Problem.create(data);
    return problem;
  }

  async updateProblem(id, data) {
    const problem = await Problem.findById(id);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    if (data.slug && data.slug !== problem.slug) {
      const existing = await Problem.findOne({ slug: data.slug });
      if (existing) {
        throw new AppError('A problem with this slug already exists', 409);
      }
    }

    // Increment version if critical fields change
    if (data.description || data.starterTemplates || data.timeLimitMs || data.memoryLimitKb) {
      data.version = problem.version + 1;
    }

    Object.assign(problem, data);
    await problem.save();
    return problem;
  }

  async addTestCase(problemId, data) {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const count = await TestCase.countDocuments({ problemId });
    const order = data.order !== undefined ? data.order : count + 1;

    const testCase = await TestCase.create({
      ...data,
      problemId,
      order
    });

    return testCase;
  }

  async updateTestCase(id, data) {
    const testCase = await TestCase.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }
    return testCase;
  }

  async deleteTestCase(id) {
    const testCase = await TestCase.findByIdAndDelete(id);
    if (!testCase) {
      throw new AppError('Test case not found', 404);
    }
    return { id };
  }

  async publishProblem(id) {
    const problem = await Problem.findById(id);
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    // Validation rules before publication:
    // 1. Must have at least 1 public test case
    // 2. Must have at least 1 private evaluation test case
    const [publicCount, privateCount] = await Promise.all([
      TestCase.countDocuments({ problemId: id, isPublic: true }),
      TestCase.countDocuments({ problemId: id, isPublic: false })
    ]);

    if (publicCount === 0) {
      throw new AppError('Problem must have at least one public sample test case before publication', 400);
    }

    if (privateCount === 0) {
      throw new AppError('Problem must have at least one private evaluation test case before publication', 400);
    }

    // 3. Must have valid starter templates for supported languages
    if (!problem.starterTemplates || (problem.starterTemplates instanceof Map && problem.starterTemplates.size === 0)) {
      if (typeof problem.starterTemplates === 'object' && Object.keys(problem.starterTemplates).length === 0) {
        throw new AppError('Problem must have starter templates configured', 400);
      }
    }

    problem.isPublished = !problem.isPublished;
    await problem.save();

    return {
      id: problem._id,
      title: problem.title,
      isPublished: problem.isPublished
    };
  }

  async getExecutionHealth() {
    const [totalUsers, totalProblems, totalSubmissions, pendingJobs] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ status: { $in: ['queued', 'processing', 'running'] } })
    ]);

    return {
      status: 'healthy',
      provider: config.executionProvider,
      stats: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        pendingJobs
      },
      timestamp: new Date()
    };
  }
}

module.exports = new AdminService();
