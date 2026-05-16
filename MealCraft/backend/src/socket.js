const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const User = require('./models/User');

module.exports = function attachSocket(io) {
  // Authenticate socket connections with the same JWT as HTTP routes
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user_id = String(decoded.user_id);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join-group', (groupId) => {
      socket.join(String(groupId));
    });

    socket.on('leave-group', (groupId) => {
      socket.leave(String(groupId));
    });

    socket.on('send-message', async ({ group_id, text }) => {
      if (!text?.trim() || !group_id) return;

      try {
        const user = await User.findById(socket.user_id).select('name');
        if (!user) return;

        const msg = await Message.create({
          group_id,
          user_id: socket.user_id,
          sender_name: user.name,
          text: text.trim(),
          type: 'text',
        });

        io.to(String(group_id)).emit('message', {
          _id: String(msg._id),
          group_id: String(group_id),
          user_id: socket.user_id,
          sender_name: user.name,
          text: msg.text,
          createdAt: msg.createdAt,
        });
      } catch (err) {
        console.error('socket send-message:', err.message);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
  });
};
