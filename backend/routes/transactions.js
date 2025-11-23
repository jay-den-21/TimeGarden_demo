const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/', getCurrentUserId, walletController.getTransactions);
router.get('/export', getCurrentUserId, walletController.exportTransactions);

module.exports = router;

