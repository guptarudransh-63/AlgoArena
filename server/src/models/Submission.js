const mongoose = require('mongoose');
const {
  SUBMISSION_TYPES,
  SUBMISSION_STATUSES,
  VERDICTS,
  RESOURCE_LIMITS
} = require('../config/constants');

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem reference is required'],
      index: true
    },
    problemVersion: {
      type: Number,
      default: 1
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      trim: true
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code is required'],
      maxlength: [RESOURCE_LIMITS.maxSourceCodeLength, `Source code cannot exceed ${RESOURCE_LIMITS.maxSourceCodeLength} characters`]
    },
    type: {
      type: String,
      enum: {
        values: SUBMISSION_TYPES,
        message: '{VALUE} is not a valid submission type'
      },
      required: [true, 'Submission type is required']
    },
    status: {
      type: String,
      enum: {
        values: SUBMISSION_STATUSES,
        message: '{VALUE} is not a valid submission status'
      },
      default: 'queued'
    },
    verdict: {
      type: String,
      enum: {
        values: [...VERDICTS, null],
        message: '{VALUE} is not a valid verdict'
      },
      default: null
    },
    runtime: {
      type: Number,
      default: null
    },
    memory: {
      type: Number,
      default: null
    },
    testsPassed: {
      type: Number,
      default: 0
    },
    totalTests: {
      type: Number,
      default: 0
    },
    error: {
      type: String,
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ userId: 1, problemId: 1, verdict: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
