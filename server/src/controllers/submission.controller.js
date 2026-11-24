const submissionService = require('../services/submission.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const runCode = catchAsync(async (req, res) => {
  const result = await submissionService.runCode(req.params.id, req.user.id, req.body);
  sendSuccess(res, result, 'Code execution completed', 200);
});

const submitCode = catchAsync(async (req, res) => {
  const result = await submissionService.submitCode(req.params.id, req.user.id, req.body);
  sendSuccess(res, result, 'Submission accepted and queued', 202);
});

const getSubmissionStatus = catchAsync(async (req, res) => {
  const status = await submissionService.getSubmissionStatus(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, { submission: status }, 'Submission status retrieved', 200);
});

const getSubmissionById = catchAsync(async (req, res) => {
  const submission = await submissionService.getSubmissionById(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, { submission }, 'Submission retrieved successfully', 200);
});

const getMySubmissionsForProblem = catchAsync(async (req, res) => {
  const result = await submissionService.getUserSubmissionsForProblem(req.params.id, req.user.id, req.query);
  sendSuccess(res, result, 'Submissions retrieved successfully', 200);
});

const getSubmissions = catchAsync(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const userRole = req.user ? req.user.role : null;
  const result = await submissionService.getSubmissions(req.query, userId, userRole);
  sendSuccess(res, result, 'Submissions retrieved successfully', 200);
});

module.exports = {
  runCode,
  submitCode,
  getSubmissionStatus,
  getSubmissionById,
  getMySubmissionsForProblem,
  getSubmissions
};
