const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { getCurrentUserId } = require('../middleware/auth');

router.get('/', tasksController.getAllTasks);
router.get('/my', getCurrentUserId, tasksController.getMyTasks);
router.post('/', getCurrentUserId, tasksController.createTask);
router.delete('/:id', getCurrentUserId, tasksController.deleteTask);
router.get('/:id', tasksController.getTaskById);

module.exports = router;

