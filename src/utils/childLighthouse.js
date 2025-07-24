// src/utils/childLighthouse.js
const mongoose = require('mongoose');
const puppeteer = require('puppeteer');
const lighthouse = (...args) => import('lighthouse').then(mod => mod.default(...args));
const { URL } = require('url');
const PageReport = require('../models/PageReport');

process.on('message', async (input) => {
  try {
    const { url, pageReportId, reportId, mongoUri } = input;
    await mongoose.connect(mongoUri);
    let browser;
    let pageReport = await PageReport.findById(pageReportId);
    if (!pageReport) throw new Error('PageReport not found');
    pageReport.status = 'auditing';
    await pageReport.save();
    process.send({ status: 'auditing', pageReportId });
    // Do NOT emit socket events here
    try {
      browser = await puppeteer.launch({ headless: 'new' });
      const { lhr } = await lighthouse(url, {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'error',
        chromeFlags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless=new',
          '--remote-debugging-port=0',
        ],
      });
      pageReport.lighthouseResult = lhr;
      pageReport.seoScore = lhr.categories.seo.score * 100;
      pageReport.status = 'complete';
      await pageReport.save();
      process.send({ success: true, pageReportId });
      process.exit(0);
    } catch (err) {
      pageReport.status = 'error';
      pageReport.error = err.message;
      await pageReport.save();
      process.send({ success: false, error: err.message, pageReportId });
      process.exit(1);
    } finally {
      if (browser) await browser.close();
      await mongoose.disconnect();
    }
  } catch (err) {
    process.send({ success: false, error: err.message });
    process.exit(1);
  }
}); 