import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/token.js';
import { registerChatHandlers } from './chatHandlers.js';
import { setIO } from './io.js';

export function initSockets(httpServer) {
  const io = new Server(httpServer, { cors: { origin: env.clientUrl } });
  setIO(io);
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
