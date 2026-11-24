const { Queue } = require('bullmq');
const { createRedisClient } = require('../config/redis');

let submissionQueue = null;

function getSubmissionQueue() {
  if (!submissionQueue) {
    try {
      const connection = createRedisClient({ lazyConnect: false });
      submissionQueue = new Queue('submissions', {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          removeOnComplete: 500,
          removeOnFail: 1000
        }
      });

      submissionQueue.on('error', (err) => {
        console.warn('[SubmissionQueue] Warning:', err.message);
      });
    } catch (err) {
      console.warn('[SubmissionQueue] Failed to initialize queue with Redis:', err.message);
    }
  }
  return submissionQueue;
}

module.exports = {
  getSubmissionQueue
};
