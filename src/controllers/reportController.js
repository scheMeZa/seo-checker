const Report = require('../models/Report');
const PageReport = require('../models/PageReport');
const { crawlSiteRecursive } = require('../utils/crawl');
const puppeteer = require('puppeteer');
const lighthouse = (...args) => import('lighthouse').then(mod => mod.default(...args));
const { URL } = require('url');

exports.createReport = async (req, res) => {
  try {
    const { url, crawl } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const report = new Report({ url, crawl: !!crawl });
    await report.save();
    res.status(201).json(report);

    // Start background processing (async, not blocking response)
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
      allLinks = await crawlSiteRecursive(url);
    }

    // Track already created PageReports
    const pageReportMap = {};
    for (const link of allLinks) {
      let pageReport = await PageReport.findOne({ report: reportId, url: link });
      if (!pageReport) {
        pageReport = new PageReport({ report: reportId, url: link, status: 'crawling' });
        await pageReport.save();
        await Report.findByIdAndUpdate(reportId, {
          $addToSet: { pageReports: pageReport._id },
        });
      } else {
        pageReport.status = 'crawling';
        await pageReport.save();
      }
      pageReportMap[link] = pageReport;
    }

    // Launch Puppeteer once for all Lighthouse runs
    const browser = await puppeteer.launch({ headless: 'new' });
    for (const link of allLinks) {
      const pageReport = pageReportMap[link];
      // Set status to 'auditing'
      pageReport.status = 'auditing';
      await pageReport.save();
      try {
        // Run Lighthouse
        const { lhr } = await lighthouse(link, {
          port: new URL(browser.wsEndpoint()).port,
          output: 'json',
          logLevel: 'error',
        });
        pageReport.lighthouseResult = lhr;
        pageReport.seoScore = lhr.categories.seo.score * 100;
        pageReport.status = 'complete';
        await pageReport.save();
      } catch (err) {
        pageReport.status = 'error';
        pageReport.error = err.message;
        await pageReport.save();
      }
    }
    await browser.close();
    await Report.findByIdAndUpdate(reportId, { status: 'complete' });
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
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .populate('pageReports');
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
