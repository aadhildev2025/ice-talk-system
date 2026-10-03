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
const expenseRoutes = require('./routes/expenseRoutes');
const { initDemoUser } = require('./utils/demoSalesService');

const path = require('path');
const fs = require('fs');
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

// Fallback defaults for standalone desktop POS executable
process.env.PORT = process.env.PORT || '5000';
process.env.MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://mubeeth17_db_user:omDriAeanrm9g1qM@cluster0.hctj1le.mongodb.net/icetalk_restaurant?retryWrites=true&w=majority&appName=Cluster0';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'icetalk_restaurant_secret_key_2026';

// Connect to MongoDB
connectDB().then(() => {
  initDemoUser();
}).catch(() => {});

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

// Ensure MongoDB connection for API requests that require MongoDB (Tables, Menu)
// Computer storage routes (Reports, POS sales, Orders, Expenses) operate locally on computer storage
app.use(async (req, res, next) => {
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  const isLocalComputerStorageRoute =
    req.path.startsWith('/api/reports') ||
    req.path.startsWith('/reports') ||
    req.path.startsWith('/api/pos') ||
    req.path.startsWith('/pos') ||
    req.path.startsWith('/api/orders') ||
    req.path.startsWith('/orders') ||
    req.path.startsWith('/api/expenses') ||
    req.path.startsWith('/expenses');

  if (isLocalComputerStorageRoute) {
    const mongoose = require('mongoose');
    if (!mongoose.connection || mongoose.connection.readyState === 0) {
      connectDB().catch(() => {});
    }
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    // If auth route, allow fallback to proceed
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/auth')) {
      return next();
    }
    console.error('[DB Middleware Error]:', err.message);
    return res.status(503).json({
      success: false,
      message: 'MongoDB connection failed. Master Tables and Menu require MongoDB Atlas connection.',
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
app.use(['/api/expenses', '/expenses'], expenseRoutes);

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
const distCandidatePaths = [
  path.join(__dirname, '../../client/dist'),
  path.join(__dirname, '../client/dist'),
  path.join(process.resourcesPath || '', 'app/client/dist'),
  path.join(process.resourcesPath || '', 'app.asar/client/dist'),
  path.join(process.resourcesPath || '', 'client/dist'),
];
const distPath = distCandidatePaths.find((p) => fs.existsSync(path.join(p, 'index.html'))) || distCandidatePaths[0];
console.log('[Server] Serving client static build from:', distPath);
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
