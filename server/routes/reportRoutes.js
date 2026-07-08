const express = require('express');
const router = express.Router();
const {
  createReport, updateReport, submitReport, getMyReports, getAllReports, getAdminReviewReports, updateReportReview
} = require('../controllers/reportController');
const { protect }      = require('../middleware/auth');
const { requireRole }  = require('../middleware/role');

router.get('/me',           protect, getMyReports);
router.get('/admin-review', protect, requireRole('admin'), getAdminReviewReports);
router.get('/',             protect, requireRole('manager'), getAllReports);
router.post('/',            protect, createReport);
router.put('/:id',          protect, updateReport);
router.put('/:id/review',   protect, requireRole('admin'), updateReportReview);
router.put('/:id/submit',   protect, submitReport);

module.exports = router;
