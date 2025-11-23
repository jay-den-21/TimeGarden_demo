const pool = require('../config/database');

/**
 * Get wallet data for current user
 */
const getWallet = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      'SELECT balance, escrow_balance as escrowBalance FROM wallets WHERE user_id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.json({ balance: 0, escrowBalance: 0 });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Get transactions for current user
 */
const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      'SELECT id, date_format(date, "%Y-%m-%d") as date, description, amount, type, status FROM transactions WHERE wallet_id = ? ORDER BY date DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getWallet,
  getTransactions
};

