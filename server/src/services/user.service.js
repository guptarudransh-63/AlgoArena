const UserProblemProgress = require('../models/UserProblemProgress');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const { USER_PROGRESS_STATUS, VERDICT, DIFFICULTIES } = require('../config/constants');

class UserService {
  /**
   * Get user progress statistics: total solved, difficulty breakdown, topic breakdown
   */
  async getUserProgress(userId) {
    // 1. Get all published problems
    const allProblems = await Problem.find({ isPublished: true }).select('difficulty tags').lean();

    // Total available by difficulty
    const totalByDifficulty = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
      Total: allProblems.length
    };

    // Total available by tag
    const totalByTag = {};

    allProblems.forEach((p) => {
      if (totalByDifficulty[p.difficulty] !== undefined) {
        totalByDifficulty[p.difficulty]++;
      }
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          totalByTag[tag] = (totalByTag[tag] || 0) + 1;
        });
      }
    });

    // 2. Get user's solved problem progress records
    const solvedProgress = await UserProblemProgress.find({
      userId,
      status: USER_PROGRESS_STATUS.SOLVED
    })
      .populate('problemId', 'difficulty tags')
      .lean();

    const solvedByDifficulty = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
      Total: 0
    };

    const solvedByTag = {};

    solvedProgress.forEach((sp) => {
      if (sp.problemId) {
        solvedByDifficulty.Total++;
        if (solvedByDifficulty[sp.problemId.difficulty] !== undefined) {
          solvedByDifficulty[sp.problemId.difficulty]++;
        }
        if (Array.isArray(sp.problemId.tags)) {
          sp.problemId.tags.forEach((tag) => {
            solvedByTag[tag] = (solvedByTag[tag] || 0) + 1;
          });
        }
      }
    });

    // 3. User submission stats and overall acceptance rate
    const submissionStats = await Submission.aggregate([
      { $match: { userId, type: 'submit' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$verdict', VERDICT.ACCEPTED] }, 1, 0] } }
        }
      }
    ]);

    const totalSubmissions = submissionStats[0]?.total || 0;
    const acceptedSubmissions = submissionStats[0]?.accepted || 0;
    const acceptanceRate =
      totalSubmissions > 0 ? parseFloat(((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)) : 0;

    // 4. Topic-wise list for progress bars
    const topicStats = Object.keys(totalByTag).map((tag) => ({
      tag,
      solved: solvedByTag[tag] || 0,
      total: totalByTag[tag] || 0,
      percentage: Math.round(((solvedByTag[tag] || 0) / totalByTag[tag]) * 100)
    })).sort((a, b) => b.total - a.total);

    // 5. Recommended next problems based on unsolved problems
    const solvedProblemIds = solvedProgress.map((sp) => sp.problemId?._id).filter(Boolean);
    const recommended = await Problem.find({
      isPublished: true,
      _id: { $nin: solvedProblemIds }
    })
      .select('title slug difficulty tags')
      .limit(5)
      .lean();

    return {
      solved: solvedByDifficulty,
      available: totalByDifficulty,
      topicStats,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      recommended
    };
  }

  /**
   * Get activity history and streak information
   */
  async getUserActivity(userId) {
    // Aggregate submissions by date (YYYY-MM-DD)
    const submissions = await Submission.aggregate([
      {
        $match: {
          userId,
          type: 'submit'
        }
      },
      {
        $project: {
          dateStr: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          }
        }
      },
      {
        $group: {
          _id: '$dateStr',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dailyActivity = {};
    submissions.forEach((item) => {
      dailyActivity[item._id] = item.count;
    });

    // Calculate streaks
    const activeDates = Object.keys(dailyActivity).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    if (activeDates.length > 0) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check current streak from today or yesterday
      let checkDate = dailyActivity[todayStr] ? today : (dailyActivity[yesterdayStr] ? yesterday : null);

      if (checkDate) {
        while (true) {
          const dStr = checkDate.toISOString().split('T')[0];
          if (dailyActivity[dStr]) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Longest streak
      for (let i = 0; i < activeDates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(activeDates[i - 1]);
          const curr = new Date(activeDates[i]);
          const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      }
    }

    return {
      dailyActivity,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalActiveDays: activeDates.length
    };
  }

  /**
   * Get user's own submissions
   */
  async getUserSubmissions(userId, query) {
    const { page = 1, limit = 20, verdict, language, problemId } = query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { userId, type: 'submit' };
    if (verdict) filter.verdict = verdict;
    if (language) filter.language = language;
    if (problemId) filter.problemId = problemId;

    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('problemId', 'title slug difficulty')
        .select('problemId language verdict runtime memory testsPassed totalTests createdAt')
        .lean(),
      Submission.countDocuments(filter)
    ]);

    return {
      submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get user's solved problems
   */
  async getSolvedProblems(userId) {
    const solved = await UserProblemProgress.find({
      userId,
      status: USER_PROGRESS_STATUS.SOLVED
    })
      .populate('problemId', 'title slug difficulty tags')
      .populate('firstAcceptedSubmissionId', 'runtime memory language createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    return {
      count: solved.length,
      problems: solved.map((s) => ({
        problem: s.problemId,
        solvedAt: s.updatedAt,
        bestSubmission: s.firstAcceptedSubmissionId
      }))
    };
  }
}

module.exports = new UserService();
