const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/', tasksController.getAllTasks);
router.get('/my', getCurrentUserId, tasksController.getMyTasks);
router.get('/:id', tasksController.getTaskById);
router.post('/', getCurrentUserId, tasksController.createTask);

module.exports = router;

