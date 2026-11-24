const mongoose = require('mongoose');
const { USER_PROGRESS_STATUSES, USER_PROGRESS_STATUS } = require('../config/constants');

const userProblemProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: USER_PROGRESS_STATUSES,
      default: USER_PROGRESS_STATUS.UNSOLVED
    },
    firstAcceptedSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      default: null
    },
    lastAttemptedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

userProblemProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProblemProgressSchema.index({ userId: 1, status: 1 });

const UserProblemProgress = mongoose.model('UserProblemProgress', userProblemProgressSchema);

module.exports = UserProblemProgress;
