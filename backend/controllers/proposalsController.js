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
 * Get proposals received for tasks posted by current user
 */
const getReceivedProposals = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.task_id AS taskId,
        p.applicant_id AS applicantId,
        u.display_name AS applicantName,
        p.amount,
        p.message,
        p.status,
        DATE_FORMAT(p.created_at, "%Y-%m-%d") AS createdAt,
        t.title AS taskTitle
      FROM proposals p
      JOIN tasks t ON p.task_id = t.id
      JOIN users u ON p.applicant_id = u.id
      WHERE t.poster_id = ?
      ORDER BY p.created_at DESC
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
    const userId = req.userId;

    // Ensure caller owns the task (row-level auth)
    const [tasks] = await pool.query('SELECT poster_id FROM tasks WHERE id = ?', [taskId]);
    if (!tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (tasks[0].poster_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view proposals for this task' });
    }

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


 // Update proposal status (Accept/Reject)
 // If accepted, a contract is automatically created.

const updateProposalStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const proposalId = req.params.id;
    const { status } = req.body; 

    if (!['accepted', 'rejected'].includes(status)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Invalid proposal status' });
    }

    // Fetch proposal and owning task for row-level auth before any writes
    const [proposals] = await connection.query('SELECT * FROM proposals WHERE id = ?', [proposalId]);
    if (!proposals.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Proposal not found' });
    }
    const proposal = proposals[0];

    const [tasks] = await connection.query('SELECT poster_id, deadline FROM tasks WHERE id = ?', [proposal.task_id]);
    if (!tasks.length) {
      await connection.rollback();
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = tasks[0];

    if (task.poster_id !== req.userId) {
      await connection.rollback();
      return res.status(403).json({ error: 'Not authorized to update proposals for this task' });
    }
    
    // 1. Update proposal status
    await connection.query(
      'UPDATE proposals SET status = ? WHERE id = ?',
      [status, proposalId]
    );

    if (status === 'accepted') {
      // check money
      const [requesterWallet] = await connection.query('SELECT balance FROM wallets WHERE user_id = ?', [task.poster_id]);
      if (requesterWallet.length === 0 || requesterWallet[0].balance < proposal.amount) {
        throw new Error('Insufficient funds to accept this proposal'); // 余额不足报错
      }

      // Deduct available balance -> Transfer to escrow balance
      await connection.query(
        'UPDATE wallets SET balance = balance - ?, escrow_balance = escrow_balance + ? WHERE user_id = ?',
        [proposal.amount, proposal.amount, task.poster_id]
      );

      // Record this 'funds lock' transaction
      await connection.query(
        'INSERT INTO transactions (wallet_id, amount, type, description, status) VALUES (?, ?, "escrow_lock", ?, "success")',
        [task.poster_id, -proposal.amount, `Funds locked for Task #${proposal.task_id}`]
      );

      // Create Contract
      await connection.query(`
        INSERT INTO contracts 
        (proposal_id, requester_id, provider_id, amount, status, start_date, end_date)
        VALUES (?, ?, ?, ?, 'active', NOW(), ?)
      `, [
        proposalId, 
        task.poster_id, 
        proposal.applicant_id, 
        proposal.amount,
        task.deadline || null
      ]);
      
      // Update task status
      await connection.query(
        'UPDATE tasks SET status = "in_progress" WHERE id = ?',
        [proposal.task_id]
      );
    }

    await connection.commit();
    res.json({ success: true, status });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    // Return specific error messages to the frontend (e.g., insufficient balance)
    res.status(500).json({ error: err.message || 'Database error' });
  } finally {
    connection.release();
  }
};

/**
 * Delete a proposal
 * Only the applicant can delete their own proposal (if it's still pending)
 */
const deleteProposal = async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    const userId = req.userId;

    if (!proposalId || isNaN(proposalId)) {
      return res.status(400).json({ error: 'Invalid proposal ID' });
    }

    // Verify proposal exists and belongs to the user
    const [proposals] = await pool.query(
      'SELECT id, applicant_id, status FROM proposals WHERE id = ?',
      [proposalId]
    );

    if (proposals.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const proposal = proposals[0];

    // Check if user is the applicant
    if (proposal.applicant_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own proposals' });
    }

    // Check if proposal is already accepted or has a contract
    if (proposal.status === 'accepted') {
      // Check if there's an active contract
      const [contracts] = await pool.query(
        'SELECT id FROM contracts WHERE proposal_id = ?',
        [proposalId]
      );
      if (contracts.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete accepted proposal with active contract' 
        });
      }
    }

    // Delete the proposal
    await pool.query('DELETE FROM proposals WHERE id = ?', [proposalId]);

    res.json({ success: true, message: 'Proposal deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getMyProposals,
  getReceivedProposals,
  getProposalsForTask,
  createProposal,
  updateProposalStatus,
  deleteProposal
};
