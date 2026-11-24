const http = require('http');
const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket');
const { startSubmissionWorker } = require('./workers/submissionWorker');

async function startServer() {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP server and initialize Socket.IO
    const server = http.createServer(app);
    initSocket(server);

    // 3. Start BullMQ submission worker
    try {
      startSubmissionWorker();
    } catch (err) {
      console.warn('[Server] BullMQ worker startup warning:', err.message);
    }

    // 4. Start listening
    server.listen(config.port, () => {
      console.log(`[Server] AlgoArena API listening on port ${config.port} in ${config.nodeEnv} mode`);
      console.log(`[Server] API Docs available at http://localhost:${config.port}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
