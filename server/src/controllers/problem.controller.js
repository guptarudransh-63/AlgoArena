const problemService = require('../services/problem.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const getProblems = catchAsync(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await problemService.getProblems(req.query, userId);
  sendSuccess(res, result, 'Problems retrieved successfully', 200);
});

const getProblemBySlug = catchAsync(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const problem = await problemService.getProblemBySlug(req.params.slug, userId);
  sendSuccess(res, { problem }, 'Problem retrieved successfully', 200);
});

const getProblemSamples = catchAsync(async (req, res) => {
  const samples = await problemService.getProblemSamples(req.params.slug);
  sendSuccess(res, { samples }, 'Sample test cases retrieved successfully', 200);
});

const getStarterCode = catchAsync(async (req, res) => {
  const starterCode = await problemService.getStarterCode(req.params.slug);
  sendSuccess(res, { starterCode }, 'Starter code retrieved successfully', 200);
});

module.exports = {
  getProblems,
  getProblemBySlug,
  getProblemSamples,
  getStarterCode
};
