const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { applyDbSecurity } = require('./utils/applyDbSecurity');

const apiRoutes = require('./routes');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Make io available to routes
app.set('io', io);

// API routes
app.use('/api', apiRoutes);

// Initialize Socket.io handlers
socketHandler(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server (optionally applying DB security script)
const start = async () => {
  try {
    if (process.env.APPLY_DB_SECURITY === 'true') {
      await applyDbSecurity();
    }
  } catch (err) {
    console.error('DB security bootstrap failed. Server will still start.', err.message);
  }

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io server initialized`);
  });
};

start();
