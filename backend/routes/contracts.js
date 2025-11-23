const express = require('express');
const router = express.Router();
const contractsController = require('../controllers/contractsController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/', getCurrentUserId, contractsController.getMyContracts);
router.get('/:id', contractsController.getContractById);

module.exports = router;

