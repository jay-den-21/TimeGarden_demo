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
      // Default balance for new users is 50 TC
      return res.json({ balance: 50, escrowBalance: 0 });
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

/**
 * Export transactions in JSON or CSV format
 */
const exportTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const format = req.query.format || 'json'; // json or csv
    
    // Get transactions
    const [rows] = await pool.query(
      'SELECT id, date_format(date, "%Y-%m-%d") as date, description, amount, type, status FROM transactions WHERE wallet_id = ? ORDER BY date DESC',
      [userId]
    );

    if (format === 'csv') {
      // Convert to CSV
      const headers = ['ID', 'Date', 'Description', 'Amount', 'Type', 'Status'];
      const csvRows = [
        headers.join(','),
        ...rows.map(row => [
          row.id,
          row.date,
          `"${row.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
          parseFloat(row.amount).toFixed(2), // Format to 2 decimal places
          row.type,
          row.status
        ].join(','))
      ];
      
      const csv = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
    } else {
      // Return as JSON - format amounts to 2 decimal places
      const formattedTransactions = rows.map(row => ({
        ...row,
        amount: parseFloat(row.amount).toFixed(2)
      }));
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        userId: userId,
        transactionCount: rows.length,
        transactions: formattedTransactions
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getWallet,
  getTransactions,
  exportTransactions
};

