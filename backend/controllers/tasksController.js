const pool = require('../config/database');
const { normalizeStatus } = require('../utils/statusNormalizer');

/**
 * Get all tasks
 */
const getAllTasks = async (req, res) => {
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
 * Get tasks posted by current user
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

const createTask = async (req, res) => {
  try {
    const { title, description, budget, deadline, category, skills } = req.body;
    const userId = req.userId;

    // Validation
    if (!title || !description || !budget) {
      return res.status(400).json({ error: 'Title, description, and budget are required' });
    }

    // Insert task
    const [result] = await pool.query(
      'INSERT INTO tasks (poster_id, title, description, budget, deadline, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, description, budget, deadline || null, category || 'Tech', 'open']
    );

    const taskId = result.insertId;

    // Handle skills - insert or find existing skills and link them
    if (skills && skills.length > 0) {
      for (const skillName of skills) {
        // Check if skill exists
        let [existingSkills] = await pool.query('SELECT id FROM skills WHERE name = ?', [skillName]);
        let skillId;

        if (existingSkills.length === 0) {
          // Create new skill
          const [skillResult] = await pool.query('INSERT INTO skills (name, category) VALUES (?, ?)', [skillName, category || 'Tech']);
          skillId = skillResult.insertId;
        } else {
          skillId = existingSkills[0].id;
        }

        // Link skill to task
        await pool.query('INSERT INTO task_skills (task_id, skill_id) VALUES (?, ?)', [taskId, skillId]);
      }
    }

    // Return created task
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

