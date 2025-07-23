const express = require('express');
const router = express.Router();
const { createReport } = require('../controllers/reportController');

router.post('/api/reports', createReport);

module.exports = router;
