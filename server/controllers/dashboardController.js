const Report = require('../models/Report');
const User = require('../models/User');

// GET /api/dashboard/summary
const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    weekStart.setHours(0, 0, 0, 0);

    const totalMembers = await User.countDocuments({ role: 'member' });
    const submittedThisWeek = await Report.countDocuments({
      weekStart: { $gte: weekStart },
      status: 'submitted'
    });
    const openBlockers = await Report.countDocuments({
      status: 'submitted',
      blockers: { $nin: ['', null] }
    });

    const complianceRate = totalMembers > 0
      ? Math.round((submittedThisWeek / totalMembers) * 100)
      : 0;

    res.json({ submittedThisWeek, totalMembers, complianceRate, openBlockers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/dashboard/charts
const getCharts = async (req, res) => {
  try {
    // Submission status by team member
    const members = await User.find({ role: 'member' }, 'name email');
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    weekStart.setHours(0, 0, 0, 0);

    const submissionStatus = await Promise.all(
      members.map(async (m) => {
        const report = await Report.findOne({ userId: m._id, weekStart: { $gte: weekStart } });
        return { name: m.name, status: report ? report.status : 'pending' };
      })
    );

    // Workload by project (count reports per project)
    const workloadByProject = await Report.aggregate([
      { $group: { _id: '$projectId', count: { $sum: 1 } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: '$project' },
      { $project: { name: '$project.name', count: 1 } }
    ]);

    // Tasks completed trend (last 6 weeks, count reports submitted per week)
    const trend = await Report.aggregate([
      { $match: { status: 'submitted' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$weekStart' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } },
      { $limit: 6 }
    ]);

    res.json({ submissionStatus, workloadByProject, trend });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary, getCharts };
