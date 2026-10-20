require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const calculationRoutes = require('./routes/calculationRoutes');
const statusRoutes = require('./routes/statusRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/calculations', calculationRoutes);
app.use('/api/status', statusRoutes);

// Unified Production Client Serving (Single-Port Architecture)
const clientDistPath = path.join(__dirname, '../client/dist');
const hasClientBuild = fs.existsSync(clientDistPath);

if (hasClientBuild) {
  console.log(`Serving static production client from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all for React Single Page Application (SPA)
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If client hasn't been built yet, show API welcome
  app.get('/', (req, res) => {
    res.json({
      message: 'MERN Calculator Backend API is running! Build the client with "npm run build" to serve the frontend on this port.',
      endpoints: {
        status: '/api/status',
        getCalculations: 'GET /api/calculations',
        saveCalculation: 'POST /api/calculations',
        toggleFavorite: 'PATCH /api/calculations/:id/favorite',
        deleteCalculation: 'DELETE /api/calculations/:id',
        clearAll: 'DELETE /api/calculations',
        stats: 'GET /api/calculations/stats',
      },
    });
  });
}

// 404 Handler for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n===========================================`);
      console.log(`🚀 Unified MERN Calculator running on:`);
      console.log(`   http://localhost:${PORT}`);
      console.log(`   http://127.0.0.1:${PORT}`);
      console.log(`   Status: http://localhost:${PORT}/api/status`);
      console.log(`===========================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
