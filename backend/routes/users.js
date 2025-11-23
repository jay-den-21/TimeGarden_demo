const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/me', getCurrentUserId, usersController.getCurrentUser);

module.exports = router;

