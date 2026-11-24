const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-12345';
  process.env.EXECUTION_PROVIDER = 'mock';

  const config = require('../src/config');
  config.jwtSecret = 'test-secret-key-12345';
  config.jwt = { secret: 'test-secret-key-12345', expiresIn: '7d' };

  const options = {
    instance: {
      dbName: 'algoarena_test'
    }
  };

  // Use system binary if available to avoid download timeout
  const fs = require('fs');
  if (fs.existsSync('/opt/homebrew/bin/mongod')) {
    options.binary = {
      systemBinary: '/opt/homebrew/bin/mongod'
    };
  }

  mongoServer = await MongoMemoryServer.create(options);
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  const { redisClient } = require('../src/config/redis');
  if (redisClient && typeof redisClient.disconnect === 'function') {
    try {
      redisClient.disconnect();
    } catch {}
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
