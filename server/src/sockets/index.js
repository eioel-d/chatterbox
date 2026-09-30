import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/token.js';
import { registerChatHandlers } from './chatHandlers.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, { cors: { origin: env.clientUrl } });
  io.use((socket, next) => {
    try {
      socket.user = verifyToken(socket.handshake.auth.token);
      next();
    } catch {
      next(new Error('auth'));
    }
  });
  io.on('connection', (socket) => registerChatHandlers(io, socket));
  return io;
}
