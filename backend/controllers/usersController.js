const pool = require('../config/database');

/**
 * Get current user information
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(
      'SELECT id, name, email, display_name as displayName FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getCurrentUser
};

