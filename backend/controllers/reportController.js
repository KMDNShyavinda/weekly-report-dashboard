const Report = require('../models/Report');

const demoReviewReports = [
  {
    _id: 'demo-report-1',
    reportId: 'RPT-1001',
    title: 'Quarterly Client Summary',
    employeeName: 'Jordan Lee',
    userId: { _id: 'demo-user-1', name: 'Alicia Chen' },
    projectId: { _id: 'demo-project-1', name: 'Client Expansion' },
    tasksCompleted: 'Prepared status report and reviewed deliverables.',
    tasksPlanned: 'Finalize action plan for next week.',
    blockers: 'None',
    notes: 'Submitted for manager review.',
    status: 'submitted',
    reviewStatus: 'pending',
    priority: 'high',
    createdAt: new Date('2026-07-05T09:00:00.000Z'),
    timeline: [{ title: 'Report Submitted', detail: 'Submitted by client', actor: 'Alicia Chen', createdAt: new Date('2026-07-05T09:00:00.000Z') }]
  }
];

const isDbReady = () => Report?.db?.readyState === 1;
const getReviewStatus = (report) => report.reviewStatus || (report.status === 'submitted' ? 'pending' : report.status);

// POST /api/reports — create draft
const createReport = async (req, res) => {
  try {
    if (!isDbReady()) {
      const fallbackReport = {
        ...req.body,
        _id: `demo-${Date.now()}`,
        userId: req.user._id,
        status: 'draft',
        reviewStatus: 'pending',
        timeline: []
      };
      demoReviewReports.unshift(fallbackReport);
      return res.status(201).json(fallbackReport);
    }

    const report = await Report.create({ ...req.body, userId: req.user._id, reviewStatus: 'pending', timeline: [] });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/reports/:id — edit report
const updateReport = async (req, res) => {
  try {
    if (!isDbReady()) {
      const report = demoReviewReports.find((item) => String(item._id) === String(req.params.id));
      if (!report) return res.status(404).json({ message: 'Report not found' });
      if (String(report.userId?._id || report.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
      Object.assign(report, req.body);
      return res.json(report);
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

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
    if (!isDbReady()) {
      const report = demoReviewReports.find((item) => String(item._id) === String(req.params.id));
      if (!report) return res.status(404).json({ message: 'Report not found' });
      if (String(report.userId?._id || report.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });
      report.status = 'submitted';
      report.reviewStatus = 'pending';
      report.submittedAt = new Date();
      report.timeline = [
        ...(report.timeline || []),
        { title: 'Report Submitted', detail: 'Submitted for review', actor: req.user.name || 'User', createdAt: new Date() }
      ];
      return res.json(report);
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (String(report.userId) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

    report.status = 'submitted';
    report.reviewStatus = 'pending';
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
    if (!isDbReady()) {
      const reports = demoReviewReports.filter((item) => String(item.userId?._id || item.userId) === String(req.user._id));
      return res.json(reports);
    }

    const reports = await Report.find({ userId: req.user._id })
      .populate('projectId', 'name')
      .sort({ weekStart: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/review-queue — all reports for manager review
const getReviewQueueReports = async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.json(demoReviewReports.map((report) => ({ ...report, reviewStatus: getReviewStatus(report) })));
    }

    const reports = await Report.find()
      .populate('userId', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    const payload = reports.map((report) => ({
      ...report.toObject(),
      reviewStatus: getReviewStatus(report)
    }));

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/reports/:id/review — update review state
const updateReportReview = async (req, res) => {
  try {
    if (!isDbReady()) {
      const report = demoReviewReports.find((item) => String(item._id) === String(req.params.id));
      if (!report) return res.status(404).json({ message: 'Report not found' });

      const { reviewStatus, reviewNotes, internalNotes, feedbackForClient } = req.body;
      if (reviewStatus) report.reviewStatus = reviewStatus;
      if (reviewNotes !== undefined) report.reviewNotes = reviewNotes;
      if (internalNotes !== undefined) report.internalNotes = internalNotes;
      if (feedbackForClient !== undefined) report.feedbackForClient = feedbackForClient;

      if (reviewStatus === 'approved' || reviewStatus === 'rejected' || reviewStatus === 'needs_revision') {
        report.status = reviewStatus;
      }

      report.timeline = [
        ...(report.timeline || []),
        {
          title: reviewStatus ? `Status Updated to ${reviewStatus}` : 'Comments Added',
          detail: reviewStatus ? `Manager updated the report status to ${reviewStatus}.` : 'Manager added review notes.',
          actor: req.user?.name || 'Manager',
          createdAt: new Date()
        }
      ];

      return res.json({ ...report, reviewStatus: getReviewStatus(report) });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const { reviewStatus, reviewNotes, internalNotes, feedbackForClient } = req.body;
    if (reviewStatus) report.reviewStatus = reviewStatus;
    if (reviewNotes !== undefined) report.reviewNotes = reviewNotes;
    if (internalNotes !== undefined) report.internalNotes = internalNotes;
    if (feedbackForClient !== undefined) report.feedbackForClient = feedbackForClient;

    if (reviewStatus === 'approved' || reviewStatus === 'rejected' || reviewStatus === 'needs_revision') {
      report.status = reviewStatus;
    }

    report.timeline = [
      ...(report.timeline || []),
      {
        title: reviewStatus ? `Status Updated to ${reviewStatus}` : 'Comments Added',
        detail: reviewStatus ? `Manager updated the report status to ${reviewStatus}.` : 'Manager added review notes.',
        actor: req.user?.name || 'Manager',
        createdAt: new Date()
      }
    ];

    await report.save();
    res.json({ ...report.toObject(), reviewStatus: getReviewStatus(report) });
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

module.exports = { createReport, updateReport, submitReport, getMyReports, getAllReports, getReviewQueueReports, updateReportReview };
