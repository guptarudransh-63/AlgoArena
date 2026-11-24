const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl,
      credentials: true
    }
  });

  io.use((socket, next) => {
    // Check auth via cookie or query token
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.cookie
        ?.split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        socket.user = decoded;
      } catch (err) {
        // Continue unauthenticated, but socket.user remains undefined
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
    }

    socket.on('subscribe:submission', (submissionId) => {
      socket.join(`submission:${submissionId}`);
    });

    socket.on('unsubscribe:submission', (submissionId) => {
      socket.leave(`submission:${submissionId}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

function emitSubmissionStatus(userId, submissionId, data) {
  if (!io) return;
  const payload = {
    submissionId,
    ...data,
    timestamp: new Date()
  };

  // Broadcast to submission room and user room
  io.to(`submission:${submissionId}`).emit('submission:status', payload);
  if (userId) {
    io.to(`user:${userId}`).emit('submission:status', payload);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitSubmissionStatus
};
