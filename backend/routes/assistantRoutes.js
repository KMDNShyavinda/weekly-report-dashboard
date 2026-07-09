const express = require('express');
const router = express.Router();
const { handleAssistantMessage } = require('../controllers/assistantController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.post('/message', protect, requireRole('manager'), handleAssistantMessage);

module.exports = router;
