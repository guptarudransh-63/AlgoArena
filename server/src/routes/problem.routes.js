const express = require('express');
const problemController = require('../controllers/problem.controller');
const submissionController = require('../controllers/submission.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { runCodeSchema, submitCodeSchema } = require('../validators/submission.validators');

const router = express.Router();

// Public problem exploration
router.get('/', optionalAuth, problemController.getProblems);
router.get('/:slug', optionalAuth, problemController.getProblemBySlug);
router.get('/:slug/test-samples', problemController.getProblemSamples);
router.get('/:slug/starter-code', problemController.getStarterCode);

// Code run & submission (requireAuth)
router.post('/:id/run', requireAuth, validate(runCodeSchema), submissionController.runCode);
router.post('/:id/submit', requireAuth, validate(submitCodeSchema), submissionController.submitCode);
router.get('/:id/submissions/me', requireAuth, submissionController.getMySubmissionsForProblem);

module.exports = router;
