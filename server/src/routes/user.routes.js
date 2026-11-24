const express = require('express');
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/me/progress', userController.getProgress);
router.get('/me/activity', userController.getActivity);
router.get('/me/submissions', userController.getSubmissions);
router.get('/me/solved-problems', userController.getSolvedProblems);

module.exports = router;
