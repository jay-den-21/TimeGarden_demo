const pool = require('../config/database');

/**
 * Get reviews for a specific user
 */
const getReviewsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE reviewee_id = ?',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getReviewsForUser
};

