const mongoose = require('mongoose');
const { QUEUE_STATES, QUEUE_STATE } = require('../config/constants');

const executionJobSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      unique: true,
      index: true
    },
    bullJobId: {
      type: String,
      default: null,
      index: true
    },
    queueState: {
      type: String,
      enum: QUEUE_STATES,
      default: QUEUE_STATE.PENDING
    },
    attemptCount: {
      type: Number,
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    },
    workerMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    lastError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

executionJobSchema.index({ queueState: 1, updatedAt: 1 });

const ExecutionJob = mongoose.model('ExecutionJob', executionJobSchema);

module.exports = ExecutionJob;
