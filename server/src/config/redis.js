const Redis = require('ioredis');
const config = require('./index');

const isTest = process.env.NODE_ENV === 'test' || config.isTest;

const defaultRedisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  lazyConnect: true,
  enableOfflineQueue: !isTest,
  retryStrategy(times) {
    if (isTest || times > 3) {
      return null; // Stop retrying in tests or after 3 attempts
    }
    const delay = Math.min(times * 200, 3000);
    return delay;
  }
};

const createRedisClient = (customOptions = {}) => {
  const options = {
    ...defaultRedisOptions,
    ...customOptions
  };

  const client = new Redis(config.redisUrl, options);

  client.on('connect', () => {
    if (!isTest) console.log('[Redis] Connected successfully');
  });

  client.on('ready', () => {
    if (!isTest) console.log('[Redis] Ready to accept commands');
  });

  client.on('error', (err) => {
    if (!isTest) console.error('[Redis] Error:', err.message);
  });

  client.on('close', () => {
    if (!isTest) console.warn('[Redis] Connection closed');
  });

  client.on('reconnecting', () => {
    if (!isTest) console.log('[Redis] Reconnecting...');
  });

  return client;
};

// Default shared instance
const redisClient = isTest ? null : createRedisClient();

module.exports = {
  redisClient,
  createRedisClient,
  defaultRedisOptions
};
