const pool = require('../config/database');
const { normalizeStatus } = require('../utils/statusNormalizer');

/**
 * Get proposals submitted by current user
 */
const getMyProposals = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(`
      SELECT p.id, p.task_id as taskId, p.amount, p.status, p.message, t.title as taskTitle, 
             date_format(p.created_at, "%Y-%m-%d") as createdAt, p.applicant_id as applicantId
      FROM proposals p
      JOIN tasks t ON p.task_id = t.id
      WHERE p.applicant_id = ?
    `, [userId]);
    
    const proposals = rows.map(r => ({
      ...r,
      status: normalizeStatus(r.status)
    }));
    
    res.json(proposals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Get proposals for a specific task
 */
const getProposalsForTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const [rows] = await pool.query(`
      SELECT p.id, p.amount, p.message, p.status, date_format(p.created_at, "%Y-%m-%d") as createdAt,
             u.display_name as applicantName, p.applicant_id as applicantId
      FROM proposals p
      JOIN users u ON p.applicant_id = u.id
      WHERE p.task_id = ?
    `, [taskId]);
    
    const proposals = rows.map(r => ({
      ...r,
      status: normalizeStatus(r.status)
    }));

    res.json(proposals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getMyProposals,
  getProposalsForTask
};

