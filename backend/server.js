const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const busRoutes = require('./routes/buses');
const busStopRoutes = require('./routes/busStops');
const routeRoutes = require('./routes/routes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/buses', busRoutes);
app.use('/api/bus-stops', busStopRoutes);
app.use('/api/routes', routeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Namma BMTC API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join room for bus tracking
  socket.on('track-bus', (busId) => {
    socket.join(`bus-${busId}`);
    console.log(`Client ${socket.id} tracking bus ${busId}`);
  });
  
  // Join room for route tracking
  socket.on('track-route', (routeId) => {
    socket.join(`route-${routeId}`);
    console.log(`Client ${socket.id} tracking route ${routeId}`);
  });
  
  // Stop tracking
  socket.on('stop-tracking', (id) => {
    socket.leave(`bus-${id}`);
    socket.leave(`route-${id}`);
    console.log(`Client ${socket.id} stopped tracking ${id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Function to broadcast bus location updates
const broadcastBusUpdate = (busId, updateData) => {
  io.to(`bus-${busId}`).emit('bus-location-update', {
    busId,
    ...updateData,
    timestamp: new Date().toISOString()
  });
};

// Function to broadcast route updates
const broadcastRouteUpdate = (routeId, updateData) => {
  io.to(`route-${routeId}`).emit('route-update', {
    routeId,
    ...updateData,
    timestamp: new Date().toISOString()
  });
};

// Make broadcast functions available globally
global.broadcastBusUpdate = broadcastBusUpdate;
global.broadcastRouteUpdate = broadcastRouteUpdate;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚌 Namma BMTC API Server is running!
🌐 Server: http://localhost:${PORT}
🌐 Network: http://10.77.179.139:${PORT}
🔗 Health Check: http://10.77.179.139:${PORT}/api/health
📊 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
