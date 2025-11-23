const pool = require('../config/database');

/**
 * Get all threads for current user
 */
const getThreads = async (req, res) => {
  try {
    const userId = req.userId;
    const [threads] = await pool.query(`
      SELECT t.id, t.task_id as taskId, task.title as taskTitle, date_format(t.last_message_at, "%Y-%m-%d %H:%i") as lastMessageTime
      FROM threads t
      JOIN thread_participants tp ON t.id = tp.thread_id
      JOIN tasks task ON t.task_id = task.id
      WHERE tp.user_id = ?
      ORDER BY t.last_message_at DESC
    `, [userId]);

    for (let thread of threads) {
      const [participants] = await pool.query(`
        SELECT u.display_name as name, u.id 
        FROM thread_participants tp 
        JOIN users u ON tp.user_id = u.id 
        WHERE tp.thread_id = ? AND tp.user_id != ?
        LIMIT 1
      `, [thread.id, userId]);
      
      thread.partnerName = participants.length > 0 ? participants[0].name : 'Unknown';
      thread.partnerId = participants.length > 0 ? participants[0].id : 0;

      const [msgs] = await pool.query(
        'SELECT body FROM messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1',
        [thread.id]
      );
      thread.lastMessage = msgs.length > 0 ? msgs[0].body : '';
      thread.unreadCount = 0; 
    }
    
    res.json(threads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Get messages for a specific thread
 */
const getThreadMessages = async (req, res) => {
  try {
    const threadId = req.params.id;
    const userId = req.userId;
    const [rows] = await pool.query(`
      SELECT m.id, m.thread_id as threadId, m.user_id as senderId, m.body as text, 
             date_format(m.created_at, "%H:%i") as timestamp,
             u.display_name as senderName, m.attachments
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.thread_id = ?
      ORDER BY m.created_at ASC
    `, [threadId]);
    
    const messages = rows.map(r => ({
      ...r,
      isMe: r.senderId === userId
    }));
    
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Send a message to a thread
 */
const sendMessage = async (req, res) => {
  try {
    const threadId = parseInt(req.params.id) || parseInt(req.body.threadId);
    const { text } = req.body;
    const userId = req.userId;

    if (!threadId || isNaN(threadId) || !text) {
      return res.status(400).json({ error: 'Thread ID and message text are required' });
    }

    // Verify user is a participant in the thread
    const [participants] = await pool.query(
      'SELECT user_id FROM thread_participants WHERE thread_id = ? AND user_id = ?',
      [threadId, userId]
    );

    if (participants.length === 0) {
      return res.status(403).json({ error: 'You are not a participant in this thread' });
    }

    // Insert message into database
    const [result] = await pool.query(
      'INSERT INTO messages (thread_id, user_id, body) VALUES (?, ?, ?)',
      [threadId, userId, text]
    );

    const messageId = result.insertId;

    // Update thread's last_message_at
    await pool.query(
      'UPDATE threads SET last_message_at = NOW() WHERE id = ?',
      [threadId]
    );

    // Get message with user info
    // Note: Using 'body' as per schema.sql, mapping to 'text' for frontend compatibility
    const [messages] = await pool.query(`
      SELECT m.id, m.thread_id as threadId, m.user_id as senderId, m.body as text, 
             date_format(m.created_at, "%H:%i") as timestamp,
             u.display_name as senderName, m.attachments
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.id = ?
    `, [messageId]);

    const message = {
      ...messages[0],
      isMe: messages[0].senderId === userId
    };

    // Emit via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      // Get all participants
      const [allParticipants] = await pool.query(
        'SELECT user_id FROM thread_participants WHERE thread_id = ?',
        [threadId]
      );

      // Emit to each participant with correct isMe flag
      allParticipants.forEach(participant => {
        const participantId = participant.user_id;
        const isMe = participantId === userId;
        
        io.to(`user:${participantId}`).emit('new_message', {
          ...message,
          isMe: isMe
        });
      });

      // Also emit to thread room for anyone listening
      io.to(`thread:${threadId}`).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getThreads,
  getThreadMessages,
  sendMessage
};

