const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  weekStart: {
    type: Date,
    required: [true, 'Week start date is required']
  },
  weekEnd: {
    type: Date,
    required: [true, 'Week end date is required']
  },
  tasksCompleted: {
    type: String,
    required: [true, 'Tasks completed is required']
  },
  tasksPlanned: {
    type: String,
    required: [true, 'Tasks planned is required']
  },
  blockers: {
    type: String,
    default: ''
  },
  hoursWorked: {
    type: Number,
    min: 0,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'late'],
    default: 'draft'
  },
  submittedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
