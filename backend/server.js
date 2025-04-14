const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { initializeSocket } = require("./config/socket");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const chatRoutes = require("./routes/chatRoutes");
const searchRoutes = require("./routes/searchRoutes");
const authRoutes = require('./routes/authRoutes');
const exchangeRoutes = require('./routes/exchangeRoutes');
const activityRoutes = require('./routes/activityRoutes');
const skillMatchRoutes = require('./routes/skillMatchRoutes');
const learningProgressRoutes = require('./routes/learningProgressRoutes');
const matchRoutes = require('./routes/matchRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const path = require("path");
const fs = require("fs");
const jwt = require('jsonwebtoken');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
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
  setHeaders: (res, filePath) => {
    try {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      // Set cache control with a shorter max-age and must-revalidate
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      
      // Set content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg') {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      }
      
      // Add ETag for cache validation
      const stats = fs.statSync(filePath);
      const etag = `${stats.size}-${stats.mtime.getTime()}`;
      res.setHeader('ETag', etag);
      
      // Add additional security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
    } catch (error) {
      console.error('Error setting headers for file:', filePath, error);
      // Set default headers even if there's an error
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Initialize Socket.IO with proper configuration
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', exchangeRoutes);
app.use('/api', activityRoutes);
app.use('/api', skillMatchRoutes);
app.use('/api/learning-progress', learningProgressRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);

// Debug: Log all registered routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(`Route: ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach(function(h) {
      if (h.route) {
        console.log(`Route: ${h.route.stack[0].method.toUpperCase()} ${r.regexp}${h.route.path}`);
      }
    });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Skill Barter API is Running!");
});

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught an error:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request method:', req.method);
  console.error('Request body:', req.body);
  console.error('Request params:', req.params);
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    details: err.details || 'No additional details available'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});