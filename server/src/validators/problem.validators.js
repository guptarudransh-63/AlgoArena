const { z } = require('zod');
const { DIFFICULTIES, RESOURCE_LIMITS, SUPPORTED_LANGUAGE_KEYS } = require('../config/constants');

const exampleSchema = z.object({
  input: z.string().min(1, 'Example input is required'),
  output: z.string().min(1, 'Example output is required'),
  explanation: z.string().optional()
});

const createProblemSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  slug: z.string().trim().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  difficulty: z.enum(DIFFICULTIES),
  tags: z.array(z.string().trim()).default([]),
  examples: z.array(exampleSchema).default([]),
  constraints: z.array(z.string().trim()).default([]),
  starterTemplates: z.record(z.string()).optional(),
  supportedLanguages: z.array(z.enum(SUPPORTED_LANGUAGE_KEYS)).optional(),
  timeLimitMs: z.number().int().min(RESOURCE_LIMITS.minTimeLimitMs).max(RESOURCE_LIMITS.maxTimeLimitMs).optional(),
  memoryLimitKb: z.number().int().min(RESOURCE_LIMITS.minMemoryLimitKb).max(RESOURCE_LIMITS.maxMemoryLimitKb).optional(),
  editorial: z.string().optional(),
  hints: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
});

const updateProblemSchema = createProblemSchema.partial();

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  isPublic: z.boolean().default(false),
  order: z.number().int().optional(),
  metadata: z.record(z.any()).optional()
});

const updateTestCaseSchema = testCaseSchema.partial();

module.exports = {
  createProblemSchema,
  updateProblemSchema,
  testCaseSchema,
  updateTestCaseSchema
};
