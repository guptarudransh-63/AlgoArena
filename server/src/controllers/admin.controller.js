const adminService = require('../services/admin.service');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');

const getAllProblems = catchAsync(async (req, res) => {
  const result = await adminService.getAllProblemsAdmin(req.query);
  sendSuccess(res, result, 'Admin problems retrieved successfully', 200);
});

const getProblemById = catchAsync(async (req, res) => {
  const problem = await adminService.getProblemByIdAdmin(req.params.id);
  sendSuccess(res, { problem }, 'Problem details retrieved successfully', 200);
});

const createProblem = catchAsync(async (req, res) => {
  const problem = await adminService.createProblem(req.body);
  sendSuccess(res, { problem }, 'Problem created successfully', 201);
});

const updateProblem = catchAsync(async (req, res) => {
  const problem = await adminService.updateProblem(req.params.id, req.body);
  sendSuccess(res, { problem }, 'Problem updated successfully', 200);
});

const addTestCase = catchAsync(async (req, res) => {
  const testCase = await adminService.addTestCase(req.params.id, req.body);
  sendSuccess(res, { testCase }, 'Test case added successfully', 201);
});

const updateTestCase = catchAsync(async (req, res) => {
  const testCase = await adminService.updateTestCase(req.params.id, req.body);
  sendSuccess(res, { testCase }, 'Test case updated successfully', 200);
});

const deleteTestCase = catchAsync(async (req, res) => {
  const result = await adminService.deleteTestCase(req.params.id);
  sendSuccess(res, result, 'Test case deleted successfully', 200);
});

const publishProblem = catchAsync(async (req, res) => {
  const result = await adminService.publishProblem(req.params.id);
  sendSuccess(res, result, 'Problem publication status updated', 200);
});

const getExecutionHealth = catchAsync(async (req, res) => {
  const health = await adminService.getExecutionHealth();
  sendSuccess(res, health, 'Execution health retrieved successfully', 200);
});

module.exports = {
  getAllProblems,
  getProblemById,
  createProblem,
  updateProblem,
  addTestCase,
  updateTestCase,
  deleteTestCase,
  publishProblem,
  getExecutionHealth
};
