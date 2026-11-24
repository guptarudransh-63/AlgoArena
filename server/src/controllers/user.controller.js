const userService = require('../services/user.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const getProgress = catchAsync(async (req, res) => {
  const progress = await userService.getUserProgress(req.user.id);
  sendSuccess(res, progress, 'User progress retrieved successfully', 200);
});

const getActivity = catchAsync(async (req, res) => {
  const activity = await userService.getUserActivity(req.user.id);
  sendSuccess(res, activity, 'User activity retrieved successfully', 200);
});

const getSubmissions = catchAsync(async (req, res) => {
  const result = await userService.getUserSubmissions(req.user.id, req.query);
  sendSuccess(res, result, 'User submissions retrieved successfully', 200);
});

const getSolvedProblems = catchAsync(async (req, res) => {
  const solved = await userService.getSolvedProblems(req.user.id);
  sendSuccess(res, solved, 'Solved problems retrieved successfully', 200);
});

module.exports = {
  getProgress,
  getActivity,
  getSubmissions,
  getSolvedProblems
};
