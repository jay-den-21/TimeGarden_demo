const express = require('express');
const router = express.Router();
const proposalsController = require('../controllers/proposalsController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/my', getCurrentUserId, proposalsController.getMyProposals);
router.get('/received', getCurrentUserId, proposalsController.getReceivedProposals);
router.post('/', getCurrentUserId, proposalsController.createProposal);  // Move this BEFORE /task/:taskId
router.get('/task/:taskId', proposalsController.getProposalsForTask);
// Route to handle proposal status updates (Accept/Reject)
router.patch('/:id/status', getCurrentUserId, proposalsController.updateProposalStatus);
router.delete('/:id', getCurrentUserId, proposalsController.deleteProposal);
module.exports = router;
