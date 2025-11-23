const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

router.get('/user/:userId', reviewsController.getReviewsForUser);

module.exports = router;

