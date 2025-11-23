const express = require('express');
const router = express.Router();

const usersRoutes = require('./users');
const walletRoutes = require('./wallet');
const transactionsRoutes = require('./transactions');
const tasksRoutes = require('./tasks');
const proposalsRoutes = require('./proposals');
const contractsRoutes = require('./contracts');
const messagesRoutes = require('./messages');
const reviewsRoutes = require('./reviews');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// API routes
router.use('/users', usersRoutes);
router.use('/wallet', walletRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/tasks', tasksRoutes);
router.use('/proposals', proposalsRoutes);
router.use('/contracts', contractsRoutes);
router.use('/', messagesRoutes); // Threads routes are at root level
router.use('/reviews', reviewsRoutes);

module.exports = router;

