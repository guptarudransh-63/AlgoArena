const path = require('path');
const dotenv = require('dotenv');

// Load .env from server directory first, then root directory as fallback
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/algoarena',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds

  // Client
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Judge0
  judge0: {
    baseUrl: process.env.JUDGE0_BASE_URL || 'https://judge0-ce.p.rapidapi.com',
    apiKey: process.env.JUDGE0_API_KEY || '',
    apiHost: process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com'
  },

  // Execution Provider: mock | judge0
  executionProvider: process.env.EXECUTION_PROVIDER || 'mock',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
  },
  submissionRateLimit: {
    windowMs: parseInt(process.env.SUBMISSION_RATE_LIMIT_WINDOW_MS, 10) || 60 * 1000,
    max: parseInt(process.env.SUBMISSION_RATE_LIMIT_MAX, 10) || 10
  }
};

module.exports = config;
