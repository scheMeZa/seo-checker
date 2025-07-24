// src/utils/queue.js
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const { fork } = require('child_process');
const dotenv = require('dotenv');
dotenv.config();
const Report = require('../models/Report');
const PageReport = require('../models/PageReport');
const { io } = require('../app');

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
      child.on('message', async result => {
        // Handle 'auditing' status message from child
        if (result && result.status === 'auditing') {
          const pageReport = await PageReport.findById(pageReportId);
          if (io && pageReport) {
            io.emit('pageReportUpdated', { reportId, pageReport });
          }
          return; // Don't resolve/reject yet
        }
        if (result && result.success) {
          // Notify about page report completion
          const pageReport = await PageReport.findById(pageReportId);
          if (io && pageReport) {
            io.emit('pageReportUpdated', { reportId, pageReport });
          }
          PageReport.find({ report: reportId }).then(async pageReports => {
            const allDone = pageReports.every(pr => pr.status === 'complete' || pr.status === 'error');
            if (allDone) {
              await Report.findByIdAndUpdate(reportId, { status: 'complete' });
              const report = await Report.findById(reportId).populate('pageReports');
              if (io && report) {
                io.emit('reportUpdated', { reportId, report });
              }
            }
          });
          resolve(result);
        } else {
          // Notify about page report error
          const pageReport = await PageReport.findById(pageReportId);
          if (io && pageReport) {
            io.emit('pageReportUpdated', { reportId, pageReport });
          }
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