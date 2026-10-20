const express = require('express');
const router = express.Router();
const dbConfig = require('../config/db');

router.get('/', (req, res) => {
  const dbStatus = dbConfig.getStatus();
  res.json({
    status: 'ok',
    service: 'MERN Calculator API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    database: {
      type: dbStatus.isConnected ? 'MongoDB' : 'Fallback File/Memory',
      connected: dbStatus.isConnected,
      usingFallback: dbStatus.usingFallback,
      dbName: dbStatus.dbName,
      connectionString: dbStatus.connectionString,
      note: dbStatus.isConnected
        ? 'MongoDB is live and storing records'
        : 'Running in safe local fallback storage. Set MONGODB_URI in server/.env to connect to MongoDB Atlas or local daemon.',
    },
  });
});

module.exports = router;
