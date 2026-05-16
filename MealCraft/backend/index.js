require('dotenv').config();

const { connectDB } = require('./src/config/db');

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  require('./src/app');
}

startServer();