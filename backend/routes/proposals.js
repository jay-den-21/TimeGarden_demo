const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposalsController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/my', getCurrentUserId, proposalsController.getMyProposals);
router.get('/task/:taskId', proposalsController.getProposalsForTask);

module.exports = router;

