const mongoose = require('mongoose');
const { DIFFICULTIES, RESOURCE_LIMITS, SUPPORTED_LANGUAGE_KEYS } = require('../config/constants');

const exampleSchema = new mongoose.Schema(
  {
    input: {
      type: String,
      required: true
    },
    output: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Problem slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Problem description is required']
    },
    examples: {
      type: [exampleSchema],
      default: []
    },
    constraints: {
      type: [String],
      default: []
    },
    difficulty: {
      type: String,
      enum: {
        values: DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level'
      },
      required: [true, 'Difficulty level is required']
    },
    tags: {
      type: [String],
      default: []
    },
    starterTemplates: {
      type: Map,
      of: String,
      default: () => new Map()
    },
    supportedLanguages: {
      type: [String],
      default: () => [...SUPPORTED_LANGUAGE_KEYS]
    },
    timeLimitMs: {
      type: Number,
      default: RESOURCE_LIMITS.defaultTimeLimitMs,
      min: [RESOURCE_LIMITS.minTimeLimitMs, `Time limit cannot be less than ${RESOURCE_LIMITS.minTimeLimitMs}ms`],
      max: [RESOURCE_LIMITS.maxTimeLimitMs, `Time limit cannot exceed ${RESOURCE_LIMITS.maxTimeLimitMs}ms`]
    },
    memoryLimitKb: {
      type: Number,
      default: RESOURCE_LIMITS.defaultMemoryLimitKb,
      min: [RESOURCE_LIMITS.minMemoryLimitKb, `Memory limit cannot be less than ${RESOURCE_LIMITS.minMemoryLimitKb}KB`],
      max: [RESOURCE_LIMITS.maxMemoryLimitKb, `Memory limit cannot exceed ${RESOURCE_LIMITS.maxMemoryLimitKb}KB`]
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    version: {
      type: Number,
      default: 1
    },
    editorial: {
      type: String,
      default: ''
    },
    hints: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes
problemSchema.index({ difficulty: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ isPublished: 1 });
problemSchema.index({ difficulty: 1, isPublished: 1 });

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;
