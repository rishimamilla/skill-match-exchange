const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
let onlineUsers = new Map(); // Store online users

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    allowEIO3: true
  });

  // Debug logging for socket events
  io.engine.on("connection_error", (err) => {
    console.log('Socket.IO connection error:', err.req);	// print the error
    console.log('Socket.IO error code:', err.code);    	// error code, for example 1
    console.log('Socket.IO error message:', err.message); // error message, for example "Session ID unknown"
    console.log('Socket.IO error context:', err.context);	// some additional error context
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    console.log('Socket authentication attempt');
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('Socket authentication failed: No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      // Get user details
      const user = await User.findById(decoded.id).select('name');
      socket.userName = user?.name || 'Unknown User';
      console.log('Socket authenticated for user:', decoded.id);
      next();
    } catch (err) {
      console.log('Socket authentication failed:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Add user to online users when they connect
    if (socket.userId) {
      onlineUsers.set(socket.userId, {
        socketId: socket.id,
        userId: socket.userId,
        name: socket.userName
      });
      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.values()));
    }

    // Handle joining user's personal room
    socket.on('joinUserRoom', (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
    });

    // Handle user online status
    socket.on('userOnline', async (userId) => {
      if (userId) {
        const user = await User.findById(userId).select('name');
        onlineUsers.set(userId, {
          socketId: socket.id,
          userId: userId,
          name: user?.name || 'Unknown User'
        });
        io.emit('onlineUsers', Array.from(onlineUsers.values()));
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Remove user from online users when they disconnect
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        // Broadcast updated online users list
        io.emit('onlineUsers', Array.from(onlineUsers.values()));
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
}; 