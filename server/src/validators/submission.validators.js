const { z } = require('zod');
const { SUPPORTED_LANGUAGE_KEYS } = require('../config/constants');

const runCodeSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGE_KEYS, {
    errorMap: () => ({ message: `Supported languages are: ${SUPPORTED_LANGUAGE_KEYS.join(', ')}` })
  }),
  sourceCode: z
    .string()
    .min(1, 'Source code cannot be empty')
    .max(50000, 'Source code cannot exceed 50,000 characters'),
  customInput: z.string().max(10000, 'Custom input is too large').optional()
});

const submitCodeSchema = z.object({
  language: z.enum(SUPPORTED_LANGUAGE_KEYS, {
    errorMap: () => ({ message: `Supported languages are: ${SUPPORTED_LANGUAGE_KEYS.join(', ')}` })
  }),
  sourceCode: z
    .string()
    .min(1, 'Source code cannot be empty')
    .max(50000, 'Source code cannot exceed 50,000 characters')
});

module.exports = {
  runCodeSchema,
  submitCodeSchema
};
