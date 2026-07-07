const express = require('express');
const router = express.Router();
const { getSummary, getCharts } = require('../controllers/dashboardController');
const { protect }     = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/summary', protect, requireRole('manager'), getSummary);
router.get('/charts',  protect, requireRole('manager'), getCharts);

module.exports = router;
