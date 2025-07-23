const Report = require('../models/Report');

exports.createReport = async (req, res) => {
  try {
    const { url, crawl } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const report = new Report({ url, crawl: !!crawl });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Failed to create report' });
  }
};
