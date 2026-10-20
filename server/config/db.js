const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const state = {
  isConnected: false,
  usingFallback: false,
  connectionString: '',
  dbName: '',
  error: null,
};

const DATA_DIR = path.join(__dirname, '..', 'data');
const FALLBACK_FILE = path.join(DATA_DIR, 'calculations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create data dir:', err.message);
  }
}

// Helper to read fallback store
function getLocalStore() {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const raw = fs.readFileSync(FALLBACK_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading fallback storage:', e.message);
  }
  return [];
}

// Helper to write fallback store
function saveLocalStore(data) {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing fallback storage:', e.message);
  }
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/calculator';
  state.connectionString = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'); // mask password if any

  try {
    console.log(`Connecting to MongoDB at: ${state.connectionString}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500, // Quick timeout so server doesn't hang if Mongo isn't running
    });

    state.isConnected = true;
    state.usingFallback = false;
    state.dbName = mongoose.connection.name || 'calculator';
    state.error = null;
    console.log(`MongoDB Connected successfully! Database: ${state.dbName}`);
  } catch (err) {
    state.isConnected = false;
    state.usingFallback = true;
    state.error = err.message;
    console.warn(`\n⚠️  MongoDB connection note: ${err.message}`);
    console.log(`✨ Operating in high-speed File/In-Memory fallback storage mode.`);
    console.log(`   Data will persist safely in server/data/calculations.json.`);
    console.log(`   To connect to MongoDB or MongoDB Atlas, update MONGODB_URI in server/.env\n`);
  }
};

module.exports = {
  connectDB,
  getStatus: () => ({
    isConnected: state.isConnected,
    usingFallback: state.usingFallback,
    dbName: state.dbName,
    connectionString: state.connectionString,
    error: state.error,
  }),
  getLocalStore,
  saveLocalStore,
};
