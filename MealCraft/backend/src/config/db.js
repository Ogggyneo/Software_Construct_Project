const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mealcraft';
  await mongoose.connect(uri);
  console.log('✅ MongoDB connected:', mongoose.connection.host);
}

// Kept for backward compat with index.js
async function testDatabaseConnection() {
  await connectDB();
  return true;
}

module.exports = { connectDB, testDatabaseConnection };
