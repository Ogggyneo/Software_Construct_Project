require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./src/config/db');

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  const app = require('./src/app');
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  require('./src/socket')(io);

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, () => console.log(`Server running on port ${port}`));
}

startServer();