// backend/controllers/tasksController.js

const pool = require('../config/database');
const { normalizeStatus } = require('../utils/statusNormalizer');

/**
 * Get all OPEN tasks (For Browse Page)
 * Only shows tasks that haven't been started yet.
 */
const getAllTasks = async (req, res) => {
  try {
    // [Fix 1] Added WHERE t.status = 'open' to hide in-progress/completed tasks
    const query = `
      SELECT t.id, t.title, t.description, t.budget, date_format(t.deadline, "%Y-%m-%d") as deadline, 
             t.status, t.category, date_format(t.created_at, "%Y-%m-%d") as createdAt, 
             t.poster_id as posterId, u.display_name as publisherName,
             (SELECT COUNT(*) FROM proposals p WHERE p.task_id = t.id) as proposalsCount
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
      WHERE t.status = 'open' 
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await pool.query(query);
    
    // Fetch skills for each task
    for (let task of tasks) {
      task.status = normalizeStatus(task.status);
      const [skills] = await pool.query(
        'SELECT s.name FROM skills s JOIN task_skills ts ON s.id = ts.skill_id WHERE ts.task_id = ?',
        [task.id]
      );
      task.skills = skills.map(s => s.name);
    }
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Get tasks posted by current user (Dashboard)
 * Shows ALL statuses (open, in_progress, completed, etc.)
 */
const getMyTasks = async (req, res) => {
  try {
    const userId = req.userId;
    const query = `
      SELECT t.id, t.title, t.description, t.budget, date_format(t.deadline, "%Y-%m-%d") as deadline, 
             t.status, t.category, date_format(t.created_at, "%Y-%m-%d") as createdAt, 
             t.poster_id as posterId, u.display_name as publisherName,
             (SELECT COUNT(*) FROM proposals p WHERE p.task_id = t.id) as proposalsCount
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
      WHERE t.poster_id = ?
      ORDER BY t.created_at DESC
    `;
    const [tasks] = await pool.query(query, [userId]);
    
    for (let task of tasks) {
      task.status = normalizeStatus(task.status);
      const [skills] = await pool.query(
        'SELECT s.name FROM skills s JOIN task_skills ts ON s.id = ts.skill_id WHERE ts.task_id = ?',
        [task.id]
      );
      task.skills = skills.map(s => s.name);
    }

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Get task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const [rows] = await pool.query(`
      SELECT t.id, t.title, t.description, t.budget, date_format(t.deadline, "%Y-%m-%d") as deadline, 
             t.status, t.category, date_format(t.created_at, "%Y-%m-%d") as createdAt, 
             t.poster_id as posterId, u.display_name as publisherName
      FROM tasks t
      JOIN users u ON t.poster_id = u.id
      WHERE t.id = ?
    `, [taskId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const task = rows[0];
    task.status = normalizeStatus(task.status);
    
    // [Fix 2] Ensure skills are fetched correctly
    const [skills] = await pool.query(
      'SELECT s.name FROM skills s JOIN task_skills ts ON s.id = ts.skill_id WHERE ts.task_id = ?',
      [task.id]
    );
    task.skills = skills.map(s => s.name);
    
    const [proposalsCount] = await pool.query(
      'SELECT COUNT(*) as count FROM proposals WHERE task_id = ?',
      [task.id]
    );
    task.proposalsCount = Number(proposalsCount[0].count);
    
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const { title, description, budget, deadline, category, skills } = req.body;
    const userId = req.userId;

    if (!title || !description || !budget) {
      return res.status(400).json({ error: 'Title, description, and budget are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (poster_id, title, description, budget, deadline, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, budget, deadline || null, category || 'Tech', 'open']
    );

    const taskId = result.insertId;

    // Insert skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        // 1. Check if skill exists
        let [existingSkills] = await pool.query('SELECT id FROM skills WHERE name = ?', [skillName]);
        let skillId;

        if (existingSkills.length === 0) {
          // 2. Create if not exists
          const [skillResult] = await pool.query('INSERT INTO skills (name, category) VALUES (?, ?)', [skillName, category || 'Tech']);
          skillId = skillResult.insertId;
        } else {
          skillId = existingSkills[0].id;
        }

        // 3. Link to task
        // Use IGNORE to prevent duplicate key errors if frontend sends duplicate skills
        await pool.query('INSERT IGNORE INTO task_skills (task_id, skill_id) VALUES (?, ?)', [taskId, skillId]);
      }
    }

    const [newTask] = await pool.query(
      'SELECT t.*, u.display_name as publisherName FROM tasks t JOIN users u ON t.poster_id = u.id WHERE t.id = ?',
      [taskId]
    );

    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getAllTasks,
  getMyTasks,
  getTaskById,
  createTask
};