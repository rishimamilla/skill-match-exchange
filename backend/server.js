const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const chatRoutes = require("./routes/chatRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require('./routes/authRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const activityRoutes = require('./routes/activityRoutes');
const skillMatchRoutes = require('./routes/skillMatchRoutes');
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const path = require("path");
const fs = require("fs");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"]
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// CORS configuration
const corsOptions = {
  origin: [process.env.FRONTEND_URL || "http://localhost:3000", "http://localhost:3001"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
  }
}));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', exchangeRoutes);
app.use('/api', activityRoutes);
app.use('/api', skillMatchRoutes);

// Socket.io connection handling
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');
  
  // When a user connects, add them to online users
  socket.on('userOnline', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', async (message) => {
    // Handle message sending
    io.to(message.receiverId).emit('receiveMessage', message);
  });

  // When a user disconnects, remove them from online users
  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        break;
      }
    }
    console.log('Client disconnected');
  });
});

app.get("/", (req, res) => {
  res.send("🚀 Skill Barter API is Running!");
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});