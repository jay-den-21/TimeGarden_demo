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

/**
 * Create a new proposal
 */
const createProposal = async (req, res) => {
  try {
    const { taskId, amount, message } = req.body;
    const userId = req.userId;

    // Validation
    if (!taskId || !amount || !message) {
      return res.status(400).json({ error: 'Task ID, amount, and message are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Check if task exists
    const [tasks] = await pool.query('SELECT id, poster_id, budget FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];

    // Check if user is trying to propose on their own task
    if (task.poster_id === userId) {
      return res.status(400).json({ error: 'You cannot submit a proposal on your own task' });
    }

    // Check if user already submitted a proposal for this task
    const [existingProposals] = await pool.query(
      'SELECT id FROM proposals WHERE task_id = ? AND applicant_id = ?',
      [taskId, userId]
    );
    if (existingProposals.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this task' });
    }

    // Create proposal
    const [result] = await pool.query(
      'INSERT INTO proposals (task_id, applicant_id, amount, message, status) VALUES (?, ?, ?, ?, ?)',
      [taskId, userId, amount, message, 'pending']
    );

    const proposalId = result.insertId;

    // Return created proposal
    const [newProposal] = await pool.query(`
      SELECT p.id, p.task_id as taskId, p.amount, p.status, p.message, t.title as taskTitle,
             date_format(p.created_at, "%Y-%m-%d") as createdAt, p.applicant_id as applicantId
      FROM proposals p
      JOIN tasks t ON p.task_id = t.id
      WHERE p.id = ?
    `, [proposalId]);

    res.status(201).json({
      ...newProposal[0],
      status: normalizeStatus(newProposal[0].status)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getMyProposals,
  getProposalsForTask,
  createProposal
};