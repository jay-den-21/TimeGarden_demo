const pool = require('../config/database');

/**
 * Socket.io connection handler
 */
const socketHandler = (io) => {
  // Store user socket mappings: userId -> socketId
  const userSockets = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication/joining
    socket.on('join', async (userId) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} joined with socket ${socket.id}`);
        
        // Join user-specific room
        socket.join(`user:${userId}`);
      }
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { threadId, userId, text } = data;

        if (!threadId || !userId || !text) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Save message to database
        const [result] = await pool.query(
          'INSERT INTO messages (thread_id, user_id, body) VALUES (?, ?, ?)',
          [threadId, userId, text]
        );

        const messageId = result.insertId;

        // Get user info
        const [users] = await pool.query(
          'SELECT id, display_name as displayName FROM users WHERE id = ?',
          [userId]
        );

        // Update thread's last_message_at
        await pool.query(
          'UPDATE threads SET last_message_at = NOW() WHERE id = ?',
          [threadId]
        );

        // Get thread participants
        const [participants] = await pool.query(
          'SELECT user_id FROM thread_participants WHERE thread_id = ?',
          [threadId]
        );

        // Get full message from database to match schema structure
        const [messageRows] = await pool.query(`
          SELECT m.id, m.thread_id as threadId, m.user_id as senderId, m.body as text, 
                 date_format(m.created_at, "%H:%i") as timestamp,
                 u.display_name as senderName, m.attachments
          FROM messages m
          JOIN users u ON m.user_id = u.id
          WHERE m.id = ?
        `, [messageId]);

        // Format message for response (using body from DB, mapped to text for frontend)
        const message = {
          ...messageRows[0],
          isMe: false // Will be set by client based on recipient
        };

        // Send message to all participants in the thread
        participants.forEach(participant => {
          const participantId = participant.user_id;
          const isMe = participantId === userId;
          
          io.to(`user:${participantId}`).emit('new_message', {
            ...message,
            isMe: isMe
          });
        });

        // Also emit to thread room
        io.to(`thread:${threadId}`).emit('new_message', message);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle joining a thread room
    socket.on('join_thread', (threadId) => {
      socket.join(`thread:${threadId}`);
      console.log(`Socket ${socket.id} joined thread ${threadId}`);
    });

    // Handle leaving a thread room
    socket.on('leave_thread', (threadId) => {
      socket.leave(`thread:${threadId}`);
      console.log(`Socket ${socket.id} left thread ${threadId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = socketHandler;

