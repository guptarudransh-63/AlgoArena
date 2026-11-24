const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: [true, 'Problem reference is required'],
      index: true
    },
    input: {
      type: String,
      default: ''
    },
    expectedOutput: {
      type: String,
      required: [true, 'Expected output is required']
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for sorting test cases per problem
testCaseSchema.index({ problemId: 1, order: 1 });
testCaseSchema.index({ problemId: 1, isPublic: 1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);

module.exports = TestCase;
