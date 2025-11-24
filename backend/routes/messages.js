const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messagesController');
const { getCurrentUserId } = require('../middleware/auth');

// These routes are mounted at /api, so /threads becomes /api/threads
router.get('/threads', getCurrentUserId, messagesController.getThreads);
router.get('/threads/:id/messages', getCurrentUserId, messagesController.getThreadMessages);
router.post('/threads/:id/messages', getCurrentUserId, messagesController.sendMessage);
router.post('/threads/initiate', getCurrentUserId, messagesController.initiateThread);
router.delete('/messages/:id', getCurrentUserId, messagesController.deleteMessage);
router.delete('/threads/:id', getCurrentUserId, messagesController.deleteThread);

module.exports = router;

