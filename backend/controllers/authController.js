const pool = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, displayName, password } = req.body;

    // Validation
    if (!name || !email || !displayName || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with password hash
    const [result] = await pool.query(
      'INSERT INTO users (name, email, display_name, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, displayName, hashedPassword]
    );

    const userId = result.insertId;

    // Create wallet for new user with default balance of 50 TC
    await pool.query(
      'INSERT INTO wallets (user_id, balance, escrow_balance) VALUES (?, 50.00, 0.00)',
      [userId]
    );

    // In a real app, you'd generate a JWT token here
    // For now, we'll return success
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        name,
        email,
        displayName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email, display_name as displayName, password_hash FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password
    if (!user.password_hash) {
      // Legacy user without password - for migration period
      // In production, you'd want to force password reset
      return res.status(401).json({ error: 'Please reset your password' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // In a real app, you'd generate a JWT token here
    // For now, we'll return success
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  register,
  login
};

