const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

const connectDB = async (uri = config.mongoUri, maxRetries = 5, retryDelayMs = 5000) => {
  if (isConnected) {
    return mongoose.connection;
  }

  let retries = 0;

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[Database] MongoDB disconnected');
  });

  while (retries < maxRetries) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      isConnected = true;
      return mongoose.connection;
    } catch (error) {
      retries += 1;
      console.error(`[Database] MongoDB connection attempt ${retries}/${maxRetries} failed: ${error.message}`);

      if (retries >= maxRetries) {
        if (config.isTest) {
          throw error;
        }
        console.error('[Database] Max retries reached. Failed to connect to MongoDB.');
        throw error;
      }

      console.log(`[Database] Retrying in ${retryDelayMs / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

const disconnectDB = async () => {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  isConnected = false;
  console.log('[Database] MongoDB disconnected cleanly');
};

module.exports = {
  connectDB,
  disconnectDB,
  mongoose
};
