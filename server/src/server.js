const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const posRoutes = require('./routes/posRoutes');
const reportRoutes = require('./routes/reportRoutes');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

initSocket(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Ensure MongoDB connection for API requests
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Middleware Error]:', err);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI environment variable is configured in Vercel settings with a valid MongoDB Atlas connection string.',
      error: err.message,
    });
  }
});

// API Routes (supports both /api/path and /path in case of serverless rewrite differences)
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/tables', '/tables'], tableRoutes);
app.use(['/api/menu', '/menu'], menuRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/pos', '/pos'], posRoutes);
app.use(['/api/reports', '/reports'], reportRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    restaurant: 'ICE TALK FAMILY RESTAURANT',
    database: 'connected',
    time: new Date().toISOString(),
  });
});

// Serve frontend static build if available
const distPath = path.join(__dirname, '../../client/dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🍦 ICE TALK Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
module.exports.server = server;
