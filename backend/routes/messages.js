const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { getCurrentUserId } = require('../middleware/auth');

// These routes are mounted at /api, so /threads becomes /api/threads
router.get('/threads', getCurrentUserId, messagesController.getThreads);
router.get('/threads/:id/messages', getCurrentUserId, messagesController.getThreadMessages);

module.exports = router;

