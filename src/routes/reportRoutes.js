const express = require('express');
const router = express.Router();
const { createReport, getReport, getAllReports, getPageReport } = require('../controllers/reportController');

router.post('/api/reports', createReport);
router.get('/api/reports/:id', getReport);
router.get('/api/reports', getAllReports);
router.get('/api/page-reports/:pageReportId', getPageReport);

module.exports = router;
