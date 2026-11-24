const express = require('express');
const submissionController = require('../controllers/submission.controller');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { runCodeSchema, submitCodeSchema } = require('../validators/submission.validators');

const router = express.Router();

// General submissions list
router.get('/', optionalAuth, submissionController.getSubmissions);

// Single submission details & polling
router.get('/:id', requireAuth, submissionController.getSubmissionById);
router.get('/:id/status', requireAuth, submissionController.getSubmissionStatus);

module.exports = router;
