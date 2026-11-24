const mongoose = require('mongoose');

const submissionTestResultSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true
    },
    testIndex: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    stdout: {
      type: String,
      default: ''
    },
    stderr: {
      type: String,
      default: ''
    },
    runtime: {
      type: Number,
      default: 0
    },
    memory: {
      type: Number,
      default: 0
    },
    statusId: {
      type: Number,
      default: null
    },
    statusDescription: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

submissionTestResultSchema.index({ submissionId: 1, testIndex: 1 }, { unique: true });

const SubmissionTestResult = mongoose.model('SubmissionTestResult', submissionTestResultSchema);

module.exports = SubmissionTestResult;
