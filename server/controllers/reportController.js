const Report = require('../models/Report');

// POST /api/reports — create draft
const createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, userId: req.user._id });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/reports/:id — edit report
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    Object.assign(report, req.body);
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/reports/:id/submit — submit report
const submitReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    report.status = 'submitted';
    report.submittedAt = new Date();
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/me — own reports
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .populate('projectId', 'name')
      .sort({ weekStart: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports — all reports (manager only), with filters
const getAllReports = async (req, res) => {
  try {
    const { userId, projectId, startDate, endDate } = req.query;
    const filter = {};

    if (userId)    filter.userId    = userId;
    if (projectId) filter.projectId = projectId;
    if (startDate || endDate) {
      filter.weekStart = {};
      if (startDate) filter.weekStart.$gte = new Date(startDate);
      if (endDate)   filter.weekStart.$lte = new Date(endDate);
    }

    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .sort({ weekStart: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReport, updateReport, submitReport, getMyReports, getAllReports };
