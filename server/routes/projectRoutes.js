const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect }     = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/',       protect, getProjects);
router.post('/',      protect, requireRole('manager'), createProject);
router.put('/:id',    protect, requireRole('manager'), updateProject);
router.delete('/:id', protect, requireRole('manager'), deleteProject);

module.exports = router;
