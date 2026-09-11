const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/icetalk_restaurant';

  try {
    cachedConnection = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    const conn = await cachedConnection;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    try {
      const { autoSeedIfNeeded } = require('../seed');
      await autoSeedIfNeeded();
    } catch (seedErr) {
      console.warn('[AutoSeed warning]:', seedErr.message);
    }

    return conn;
  } catch (error) {
    cachedConnection = null;
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
