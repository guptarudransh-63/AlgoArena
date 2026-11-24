const Problem = require('../models/Problem');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const UserProblemProgress = require('../models/UserProblemProgress');
const AppError = require('../utils/AppError');
const { VERDICT } = require('../config/constants');

class ProblemService {
  async getProblems(query, userId = null) {
    const {
      page = 1,
      limit = 20,
      difficulty,
      tag,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status
    } = query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Filter published problems for public listings
    const filter = { isPublished: true };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filtering requires user context
    if (status && userId) {
      const userProgress = await UserProblemProgress.find({ userId, status });
      const problemIds = userProgress.map((p) => p.problemId);
      if (status === 'unsolved') {
        const attemptedOrSolved = await UserProblemProgress.find({
          userId,
          status: { $in: ['attempted', 'solved'] }
        });
        const excludedIds = attemptedOrSolved.map((p) => p.problemId);
        filter._id = { $nin: excludedIds };
      } else {
        filter._id = { $in: problemIds };
      }
    }

    // Sort order
    const sort = {};
    if (sortBy === 'difficulty') {
      // Custom sorting for difficulty can be done or basic alpha
      sort.difficulty = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'title') {
      sort.title = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .select('-starterTemplates -editorial')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Problem.countDocuments(filter)
    ]);

    // Attach user status and acceptance rates
    let userProgressMap = new Map();
    if (userId) {
      const progressDocs = await UserProblemProgress.find({
        userId,
        problemId: { $in: problems.map((p) => p._id) }
      }).lean();
      progressDocs.forEach((doc) => {
        userProgressMap.set(doc.problemId.toString(), doc.status);
      });
    }

    // Calculate acceptance rates for the page of problems
    const problemIds = problems.map((p) => p._id);
    const statsAgg = await Submission.aggregate([
      { $match: { problemId: { $in: problemIds }, type: 'submit', status: 'completed' } },
      {
        $group: {
          _id: '$problemId',
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$verdict', VERDICT.ACCEPTED] }, 1, 0] } }
        }
      }
    ]);

    const statsMap = new Map();
    statsAgg.forEach((s) => {
      const rate = s.total > 0 ? ((s.accepted / s.total) * 100).toFixed(1) : '0.0';
      statsMap.set(s._id.toString(), {
        totalSubmissions: s.total,
        acceptanceRate: parseFloat(rate)
      });
    });

    const enrichedProblems = problems.map((p) => {
      const idStr = p._id.toString();
      const stats = statsMap.get(idStr) || { totalSubmissions: 0, acceptanceRate: 0 };
      return {
        ...p,
        userStatus: userProgressMap.get(idStr) || 'unsolved',
        totalSubmissions: stats.totalSubmissions,
        acceptanceRate: stats.acceptanceRate
      };
    });

    return {
      problems: enrichedProblems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getProblemBySlug(slug, userId = null) {
    const problem = await Problem.findOne({ slug, isPublished: true }).lean();
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    let userStatus = 'unsolved';
    if (userId) {
      const progress = await UserProblemProgress.findOne({
        userId,
        problemId: problem._id
      });
      if (progress) {
        userStatus = progress.status;
      }
    }

    // Public test cases only!
    const publicTestCases = await TestCase.find({
      problemId: problem._id,
      isPublic: true
    })
      .sort({ order: 1 })
      .select('input expectedOutput order')
      .lean();

    return {
      ...problem,
      userStatus,
      sampleTestCases: publicTestCases
    };
  }

  async getProblemSamples(slug) {
    const problem = await Problem.findOne({ slug, isPublished: true });
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    const samples = await TestCase.find({
      problemId: problem._id,
      isPublic: true
    })
      .sort({ order: 1 })
      .select('input expectedOutput order')
      .lean();

    return samples;
  }

  async getStarterCode(slug) {
    const problem = await Problem.findOne({ slug, isPublished: true });
    if (!problem) {
      throw new AppError('Problem not found', 404);
    }

    return {
      starterTemplates: problem.starterTemplates || {},
      supportedLanguages: problem.supportedLanguages
    };
  }
}

module.exports = new ProblemService();
