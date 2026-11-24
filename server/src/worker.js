const { connectDB } = require('./config/db');
const { startSubmissionWorker } = require('./workers/submissionWorker');

async function runWorker() {
  console.log('[Worker Process] Initializing standalone worker...');
  await connectDB();
  const worker = startSubmissionWorker();
  if (worker) {
    console.log('[Worker Process] Submission worker running, waiting for jobs...');
  } else {
    console.warn('[Worker Process] Worker could not be started (check Redis connection)');
  }
}

runWorker().catch((err) => {
  console.error('[Worker Process] Fatal error starting worker:', err);
  process.exit(1);
});
