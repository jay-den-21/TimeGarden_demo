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
      // Get the other participant's name
      const [participants] = await pool.query(`
        SELECT u.display_name as name, u.id 
        FROM thread_participants tp 
        JOIN users u ON tp.user_id = u.id 
        WHERE tp.thread_id = ? AND tp.user_id != ?
        LIMIT 1
      `, [thread.id, userId]);
      
      thread.partnerName = participants.length > 0 ? participants[0].name : 'Unknown';
      thread.partnerId = participants.length > 0 ? participants[0].id : 0;

      // Get the last message content
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
    
    // Fetch messages with sender details
    const [rows] = await pool.query(`
      SELECT m.id, m.thread_id as threadId, m.user_id as senderId, m.body as text, 
             date_format(m.created_at, "%H:%i") as timestamp,
             u.display_name as senderName, m.attachments
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.thread_id = ?
      ORDER BY m.created_at ASC
    `, [threadId]);
    
    // Mark messages sent by the current user
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

    // Update thread's last_message_at timestamp
    await pool.query(
      'UPDATE threads SET last_message_at = NOW() WHERE id = ?',
      [threadId]
    );

    // Get the full message object to return
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

    // Emit via Socket.io if available (Real-time update)
    const io = req.app.get('io');
    if (io) {
      // Get all participants to notify them
      const [allParticipants] = await pool.query(
        'SELECT user_id FROM thread_participants WHERE thread_id = ?',
        [threadId]
      );

      // Emit to each participant's personal socket room
      allParticipants.forEach(participant => {
        const participantId = participant.user_id;
        const isMe = participantId === userId;
        
        io.to(`user:${participantId}`).emit('new_message', {
          ...message,
          isMe: isMe
        });
      });

      // Also emit to thread room for anyone actively looking at this thread
      io.to(`thread:${threadId}`).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

/**
 * Initiate a conversation thread.
 * Checks if a thread exists for this task/participants; if not, creates one.
 * This fixes the "Message" button logic on the frontend.
 */
const initiateThread = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { taskId, partnerId } = req.body;
    const userId = req.userId;

    // 1. Check if a thread already exists for this specific task between these two users
    // We perform a self-join on thread_participants to find a thread containing both users
    const [existing] = await connection.query(`
      SELECT t.id 
      FROM threads t
      JOIN thread_participants tp1 ON t.id = tp1.thread_id
      JOIN thread_participants tp2 ON t.id = tp2.thread_id
      WHERE t.task_id = ? 
      AND tp1.user_id = ? 
      AND tp2.user_id = ?
      LIMIT 1
    `, [taskId, userId, partnerId]);

    if (existing.length > 0) {
      // Thread exists, return it directly so frontend can redirect
      connection.release();
      return res.json({ threadId: existing[0].id, isNew: false });
    }

    // 2. If not, start a transaction to create a new thread
    await connection.beginTransaction();

    // Create the thread entry
    const [threadResult] = await connection.query(
      'INSERT INTO threads (task_id, last_message_at) VALUES (?, NOW())',
      [taskId]
    );
    const newThreadId = threadResult.insertId;

    // Add both participants (Current User & Partner) to the thread
    await connection.query(
      'INSERT INTO thread_participants (thread_id, user_id, role) VALUES (?, ?, ?), (?, ?, ?)',
      [newThreadId, userId, 'poster', newThreadId, partnerId, 'applicant']
    );

    // Insert an initial system message to make the thread visible in the list immediately
    await connection.query(
      'INSERT INTO messages (thread_id, user_id, body) VALUES (?, ?, ?)',
      [newThreadId, userId, 'Started a new conversation about this task.']
    );

    await connection.commit();
    res.status(201).json({ threadId: newThreadId, isNew: true });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Delete a message
 * Only the message sender can delete their own message
 */
const deleteMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.id);
    const userId = req.userId;

    if (!messageId || isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    // Verify message exists and belongs to the user
    const [messages] = await pool.query(
      'SELECT id, user_id, thread_id FROM messages WHERE id = ?',
      [messageId]
    );

    if (messages.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messages[0];

    // Check if user is the sender
    if (message.user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Delete the message
    await pool.query('DELETE FROM messages WHERE id = ?', [messageId]);

    // Update thread's last_message_at if this was the last message
    const [remainingMessages] = await pool.query(
      'SELECT id, created_at FROM messages WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1',
      [message.thread_id]
    );

    if (remainingMessages.length > 0) {
      await pool.query(
        'UPDATE threads SET last_message_at = ? WHERE id = ?',
        [remainingMessages[0].created_at, message.thread_id]
      );
    } else {
      // If no messages left, update to current time
      await pool.query(
        'UPDATE threads SET last_message_at = NOW() WHERE id = ?',
        [message.thread_id]
      );
    }

    // Emit deletion event via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`thread:${message.thread_id}`).emit('message_deleted', { messageId });
    }

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  getThreads,
  getThreadMessages,
  sendMessage,
  initiateThread,
  deleteMessage
};