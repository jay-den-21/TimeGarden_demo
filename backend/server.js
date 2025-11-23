const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const CURRENT_USER_ID = 2; // Hardcoded for simulation matching frontend mock requirements

// Helper to normalize status strings from DB to Frontend Enums
const normalizeStatus = (status) => {
  if (status === 'in_progress') return 'in-progress';
  if (status === 'awaiting_review') return 'awaiting_review';
  // Add other mappings here if necessary
  return status;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected' });
});

// --- Users ---
app.get('/api/users/me', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, display_name as displayName FROM users WHERE id = ?', [CURRENT_USER_ID]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Wallet ---
app.get('/api/wallet', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT balance, escrow_balance as escrowBalance FROM wallets WHERE user_id = ?', [CURRENT_USER_ID]);
    if (rows.length === 0) return res.json({ balance: 0, escrowBalance: 0 });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Transactions ---
app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, date_format(date, "%Y-%m-%d") as date, description, amount, type, status FROM transactions WHERE wallet_id = ? ORDER BY date DESC',
      [CURRENT_USER_ID]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Tasks ---
app.get('/api/tasks', async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.title, t.description, t.budget, date_format(t.deadline, "%Y-%m-%d") as deadline, 
             t.status, t.category, date_format(t.created_at, "%Y-%m-%d") as createdAt, 
             t.poster_id as posterId, u.display_name as publisherName,
             (SELECT COUNT(*) FROM proposals p WHERE p.task_id = t.id) as proposalsCount
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
    `;
    const [tasks] = await pool.query(query);
    
    // Fetch skills and normalize status
    for (let task of tasks) {
      task.status = normalizeStatus(task.status);
      const [skills] = await pool.query('SELECT s.name FROM skills s JOIN task_skills ts ON s.id = ts.skill_id WHERE ts.task_id = ?', [task.id]);
      task.skills = skills.map(s => s.name);
    }
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/tasks/my', async (req, res) => {
  try {
    const query = `
      SELECT t.id, t.title, t.description, t.budget, date_format(t.deadline, "%Y-%m-%d") as deadline, 
             t.status, t.category, date_format(t.created_at, "%Y-%m-%d") as createdAt, 
             t.poster_id as posterId, u.display_name as publisherName,
             (SELECT COUNT(*) FROM proposals p WHERE p.task_id = t.id) as proposalsCount
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
      WHERE t.poster_id = ?
    `;
    const [tasks] = await pool.query(query, [CURRENT_USER_ID]);
    
    for (let task of tasks) {
      task.status = normalizeStatus(task.status);
      const [skills] = await pool.query('SELECT s.name FROM skills s JOIN task_skills ts ON s.id = ts.skill_id WHERE ts.task_id = ?', [task.id]);
      task.skills = skills.map(s => s.name);
    }

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.description, t.budget, date_format(t.deadline, "%Y-%m-%d") as deadline, 
             t.status, t.category, date_format(t.created_at, "%Y-%m-%d") as createdAt, 
             t.poster_id as posterId, u.display_name as publisherName
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
      WHERE t.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    
    const task = rows[0];
    task.status = normalizeStatus(task.status);
    
    const [skills] = await pool.query('SELECT s.name FROM skills s JOIN task_skills ts ON s.id = ts.skill_id WHERE ts.task_id = ?', [task.id]);
    task.skills = skills.map(s => s.name);
    
    const [proposalsCount] = await pool.query('SELECT COUNT(*) as count FROM proposals WHERE task_id = ?', [task.id]);
    task.proposalsCount = Number(proposalsCount[0].count);
    
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Proposals ---
app.get('/api/proposals/my', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.task_id as taskId, p.amount, p.status, p.message, t.title as taskTitle, 
             date_format(p.created_at, "%Y-%m-%d") as createdAt, p.applicant_id as applicantId
      FROM proposals p
      JOIN tasks t ON p.task_id = t.id
      WHERE p.applicant_id = ?
    `, [CURRENT_USER_ID]);
    
    const proposals = rows.map(r => ({
      ...r,
      status: normalizeStatus(r.status)
    }));
    
    res.json(proposals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/proposals/task/:taskId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.amount, p.message, p.status, date_format(p.created_at, "%Y-%m-%d") as createdAt,
             u.display_name as applicantName, p.applicant_id as applicantId
      FROM proposals p
      JOIN users u ON p.applicant_id = u.id
      WHERE p.task_id = ?
    `, [req.params.taskId]);
    
    const proposals = rows.map(r => ({
      ...r,
      status: normalizeStatus(r.status)
    }));

    res.json(proposals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Contracts ---
app.get('/api/contracts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.proposal_id as proposalId, c.amount, c.status, date_format(c.start_date, "%Y-%m-%d") as startDate,
             t.title as taskTitle, t.id as taskId,
             req.display_name as requesterName, prov.display_name as providerName,
             c.requester_id as requesterId, c.provider_id as providerId
      FROM contracts c
      JOIN proposals p ON c.proposal_id = p.id
      JOIN tasks t ON p.task_id = t.id
      JOIN users req ON c.requester_id = req.id
      JOIN users prov ON c.provider_id = prov.id
      WHERE c.requester_id = ? OR c.provider_id = ?
    `, [CURRENT_USER_ID, CURRENT_USER_ID]);
    
    const contracts = rows.map(r => ({
      ...r,
      status: normalizeStatus(r.status)
    }));

    res.json(contracts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/contracts/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.proposal_id as proposalId, c.amount, c.status, 
             date_format(c.start_date, "%Y-%m-%d") as startDate,
             date_format(c.end_date, "%Y-%m-%d") as endDate,
             t.title as taskTitle, t.description as taskDescription, t.id as taskId, date_format(t.deadline, "%Y-%m-%d") as deadline,
             req.display_name as requesterName, req.email as requesterEmail, req.id as requesterId,
             prov.display_name as providerName, prov.email as providerEmail, prov.id as providerId
      FROM contracts c
      JOIN proposals p ON c.proposal_id = p.id
      JOIN tasks t ON p.task_id = t.id
      JOIN users req ON c.requester_id = req.id
      JOIN users prov ON c.provider_id = prov.id
      WHERE c.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });
    
    const contract = rows[0];
    contract.status = normalizeStatus(contract.status);
    res.json(contract);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Threads / Messages ---
app.get('/api/threads', async (req, res) => {
  try {
    const [threads] = await pool.query(`
      SELECT t.id, t.task_id as taskId, task.title as taskTitle, date_format(t.last_message_at, "%Y-%m-%d %H:%i") as lastMessageTime
      FROM threads t
      JOIN thread_participants tp ON t.id = tp.thread_id
      JOIN tasks task ON t.task_id = task.id
      WHERE tp.user_id = ?
      ORDER BY t.last_message_at DESC
    `, [CURRENT_USER_ID]);

    for (let thread of threads) {
      const [participants] = await pool.query(`
        SELECT u.display_name as name, u.id 
        FROM thread_participants tp 
        JOIN users u ON tp.user_id = u.id 
        WHERE tp.thread_id = ? AND tp.user_id != ?
        LIMIT 1
      `, [thread.id, CURRENT_USER_ID]);
      
      thread.partnerName = participants.length > 0 ? participants[0].name : 'Unknown';
      thread.partnerId = participants.length > 0 ? participants[0].id : 0;

      const [msgs] = await pool.query('SELECT body FROM messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1', [thread.id]);
      thread.lastMessage = msgs.length > 0 ? msgs[0].body : '';
      thread.unreadCount = 0; 
    }
    
    res.json(threads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/threads/:id/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT m.id, m.thread_id as threadId, m.user_id as senderId, m.body as text, 
             date_format(m.created_at, "%H:%i") as timestamp,
             u.display_name as senderName, m.attachments
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.thread_id = ?
      ORDER BY m.created_at ASC
    `, [req.params.id]);
    
    const messages = rows.map(r => ({
      ...r,
      isMe: r.senderId === CURRENT_USER_ID
    }));
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Reviews ---
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE reviewee_id = ?', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
