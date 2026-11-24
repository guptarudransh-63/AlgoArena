const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createProblemSchema,
  updateProblemSchema,
  testCaseSchema,
  updateTestCaseSchema
} = require('../validators/problem.validators');

const router = express.Router();

// All routes require admin
router.use(requireAdmin);

router.get('/problems', adminController.getAllProblems);
router.post('/problems', validate(createProblemSchema), adminController.createProblem);
router.get('/problems/:id', adminController.getProblemById);
router.patch('/problems/:id', validate(updateProblemSchema), adminController.updateProblem);
router.post('/problems/:id/publish', adminController.publishProblem);

router.post('/problems/:id/test-cases', validate(testCaseSchema), adminController.addTestCase);
router.patch('/test-cases/:id', validate(updateTestCaseSchema), adminController.updateTestCase);
router.delete('/test-cases/:id', adminController.deleteTestCase);

router.get('/execution-health', adminController.getExecutionHealth);

module.exports = router;
