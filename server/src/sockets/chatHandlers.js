import { Message } from '../models/Message.js';

const online = {}; // roomId -> { socketId: username }

export function registerChatHandlers(io, socket) {
  const { username } = socket.user;
  const pushUsers = (room) =>
    io.to(room).emit('roomUsers', [...new Set(Object.values(online[room] || {}))]);

  const leave = () => {
    const room = socket.roomId;
    if (!room) return;
    socket.leave(room);
    delete online[room]?.[socket.id];
    socket.to(room).emit('stopTyping', username);
    socket.roomId = null;
    pushUsers(room);
  };

  socket.on('joinRoom', (room) => {
    leave();
    socket.join(room);
    socket.roomId = room;
    (online[room] ||= {})[socket.id] = username;
    pushUsers(room);
  });

  socket.on('leaveRoom', leave);

  socket.on('sendMessage', async ({ roomId, text }) => {
    if (!text?.trim() || socket.roomId !== roomId) return;
    const msg = await Message.create({ room: roomId, sender: username, text: text.trim() });
    io.to(roomId).emit('newMessage', msg);
  });

  socket.on('typing', (room) => socket.to(room).emit('typing', username));
  socket.on('stopTyping', (room) => socket.to(room).emit('stopTyping', username));
  socket.on('disconnect', leave);
}
