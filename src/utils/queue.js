// src/utils/queue.js
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { fork } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();
const Report = require('../models/Report');
const PageReport = require('../models/PageReport');

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Concurrency for workers
const concurrency = parseInt(process.env.QUEUE_CONCURRENCY, 10) || 2;

// Create the queue (BullMQ v5: no QueueScheduler needed for normal jobs)
const pageAuditQueue = new Queue('page-audit', { connection });

// Build MongoDB URI from .env variables
const mongoUri = `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}` +
  `@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DB}?authSource=admin`;

// BullMQ Worker: Puppeteer/Lighthouse logic
const pageAuditWorker = new Worker(
  'page-audit',
  async job => {
    const { reportId, pageReportId, url } = job.data;
    return new Promise((resolve, reject) => {
      const child = fork(require.resolve('./childLighthouse.js'), [], {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env },
      });
      child.on('message', result => {
        if (result && result.success) {
          PageReport.find({ report: reportId }).then(pageReports => {
            const allDone = pageReports.every(pr => pr.status === 'complete' || pr.status === 'error');
            if (allDone) {
              Report.findByIdAndUpdate(reportId, { status: 'complete' }).catch(() => {});
            }
          });
          resolve(result);
        } else {
          reject(new Error(result && result.error ? result.error : 'Unknown error in child process'));
        }
      });
      child.on('error', err => {
        reject(err);
      });
      child.on('exit', code => {
        if (code !== 0) {
          reject(new Error('Child process exited with code ' + code));
        }
      });
      child.send({ url, pageReportId, reportId, mongoUri });
    });
  },
  { connection, concurrency }
);

module.exports = {
  pageAuditQueue,
  pageAuditWorker,
}; 