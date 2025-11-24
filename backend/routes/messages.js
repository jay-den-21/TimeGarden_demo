const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const messagesController = require('../controllers/messagesController');
const { getCurrentUserId } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// These routes are mounted at /api, so /threads becomes /api/threads
router.get('/threads', getCurrentUserId, messagesController.getThreads);
router.get('/threads/:id/messages', getCurrentUserId, messagesController.getThreadMessages);
router.post('/threads/:id/messages', getCurrentUserId, upload.single('attachment'), messagesController.sendMessage);
router.post('/threads/initiate', getCurrentUserId, messagesController.initiateThread);
router.delete('/messages/:id', getCurrentUserId, messagesController.deleteMessage);
router.delete('/threads/:id', getCurrentUserId, messagesController.deleteThread);

module.exports = router;

