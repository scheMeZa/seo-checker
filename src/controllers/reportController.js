const Report = require('../models/Report');
const PageReport = require('../models/PageReport');
const { crawlSiteRecursive } = require('../utils/crawl');
const puppeteer = require('puppeteer');
const lighthouse = (...args) => import('lighthouse').then(mod => mod.default(...args));
const { URL } = require('url');
const { pageAuditQueue } = require('../utils/queue');
const { io } = require('../app');

exports.createReport = async (req, res) => {
  try {
    const { url, crawl } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const report = new Report({ url, crawl: !!crawl });
    await report.save();
    res.status(201).json(report);
    processReport(report._id, url);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
};

async function processReport(reportId, url) {
  try {
    await Report.findByIdAndUpdate(reportId, { status: 'in_progress' });
    const report = await Report.findById(reportId);
    let allLinks = [url];
    if (report.crawl) {
      allLinks = [];
      await crawlSiteRecursive(url, undefined, async (discoveredUrl) => {
        allLinks.push(discoveredUrl);
        let pageReport = await PageReport.findOne({ report: reportId, url: discoveredUrl });
        if (!pageReport) {
          pageReport = new PageReport({ report: reportId, url: discoveredUrl, status: 'crawling' });
          await pageReport.save();
          if (io) io.emit('pageReportUpdated', { reportId, pageReport });
          await Report.findByIdAndUpdate(reportId, {
            $addToSet: { pageReports: pageReport._id },
          });
        } else {
          pageReport.status = 'crawling';
          await pageReport.save();
          if (io) io.emit('pageReportUpdated', { reportId, pageReport });
        }
      });
    } else {
      // Single page mode
      let pageReport = await PageReport.findOne({ report: reportId, url });
      if (!pageReport) {
        pageReport = new PageReport({ report: reportId, url, status: 'crawling' });
        await pageReport.save();
        if (io) io.emit('pageReportUpdated', { reportId, pageReport });
        await Report.findByIdAndUpdate(reportId, {
          $addToSet: { pageReports: pageReport._id },
        });
      } else {
        pageReport.status = 'crawling';
        await pageReport.save();
        if (io) io.emit('pageReportUpdated', { reportId, pageReport });
      }
    }

    // After crawling, set all to 'crawled' and enqueue for audit
    const pageReports = await PageReport.find({ report: reportId, status: 'crawling' });
    for (const pageReport of pageReports) {
      pageReport.status = 'crawled';
      await pageReport.save();
      if (io) io.emit('pageReportUpdated', { reportId, pageReport });
      // Enqueue a BullMQ job for this page
      await pageAuditQueue.add('audit', {
        reportId: reportId.toString(),
        pageReportId: pageReport._id.toString(),
        url: pageReport.url,
      });
    }

    // TODO: Optionally, track job completion and set report.status = 'complete' when all are done
    // For now, status is set to 'in_progress' after enqueueing
  } catch (err) {
    console.error('Error processing report:', err);
    await Report.findByIdAndUpdate(reportId, { status: 'error', error: err.message });
  }
}

exports.getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('pageReports');
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 0;
    let query = Report.find({}).sort({ createdAt: -1 }).populate('pageReports');
    if (limit > 0) query = query.limit(limit);
    const reports = await query;
    res.json(reports);
  } catch (err) {
    console.error('Error fetching all reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

exports.getPageReport = async (req, res) => {
  try {
    const pageReport = await PageReport.findById(req.params.pageReportId);
    if (!pageReport) {
      return res.status(404).json({ error: 'PageReport not found' });
    }
    res.json(pageReport);
  } catch (err) {
    console.error('Error fetching PageReport:', err);
    res.status(500).json({ error: 'Failed to fetch PageReport' });
  }
};
