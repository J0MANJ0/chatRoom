import { Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '/',
    credentials: true,
  },
});

const userSocketMap = {};

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId && userId !== 'undefined') {
    userSocketMap[userId] = socket.id;
    io.emit('onlineUsers', Object.keys(userSocketMap));
  }

  io.emit('onlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    for (const [key, value] of Object.entries(userSocketMap)) {
      if (value === socket.id) {
        delete userSocketMap[key];
        break;
      }
    }
    io.emit('onlineUsers', Object.keys(userSocketMap));
  });
});

export { io, app, server };
