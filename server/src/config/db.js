const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/icetalk_restaurant';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Automatically check and populate initial menu/accounts if MongoDB is empty on client machine
    const { autoSeedIfNeeded } = require('../seed');
    await autoSeedIfNeeded();
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Don't exit immediately so dev or client can inspect
  }
};

module.exports = connectDB;
