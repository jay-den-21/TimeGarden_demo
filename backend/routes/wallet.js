const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/', getCurrentUserId, walletController.getWallet);

module.exports = router;

