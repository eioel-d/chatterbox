import { Message } from '../models/Message.js';
import { Room } from '../models/Room.js';
import { accessFilter } from '../utils/access.js';

const online = {}; // roomId -> { socketId: username }

export function registerChatHandlers(io, socket) {
  const { username } = socket.user;
  socket.join(`u:${username}`); // personal channel, used for DM notifications

  const pushUsers = (room) =>
    io.to(room).emit('roomUsers', [...new Set(Object.values(online[room] || {}))]);

  const leave = () => {
    const room = socket.roomId;
    if (!room) return;
    socket.leave(room);
    delete online[room]?.[socket.id];
    socket.to(room).emit('stopTyping', username);
    socket.roomId = null;
    socket.dmPartner = null;
    pushUsers(room);
  };

  // Client lists the rooms it can see; we subscribe it to their unread notifications.
  socket.on('watchRooms', async (ids) => {
    try {
      const rooms = await Room.find({ _id: { $in: ids || [] }, isDM: { $ne: true }, ...accessFilter(username) }).select('_id');
      rooms.forEach((r) => socket.join(`w:${r._id}`));
    } catch { /* ignore bad ids */ }
  });

  socket.on('joinRoom', async (id) => {
    try {
      const room = await Room.findOne({ _id: id, ...accessFilter(username) });
      if (!room) return;
      leave();
      socket.join(id);
      socket.roomId = id;
      socket.dmPartner = room.isDM ? room.members.find((m) => m !== username) : null;
      (online[id] ||= {})[socket.id] = username;
      pushUsers(id);
    } catch { /* ignore */ }
  });

  socket.on('leaveRoom', leave);

  socket.on('sendMessage', async ({ roomId, text }) => {
    if (!text?.trim() || socket.roomId !== roomId) return;
    try {
      const msg = await Message.create({ room: roomId, sender: username, text: text.trim() });
      io.to(roomId).emit('newMessage', msg);
      const note = { roomId, sender: username, text: msg.text.slice(0, 60) };
      io.to(socket.dmPartner ? `u:${socket.dmPartner}` : `w:${roomId}`).emit('notify', note);
    } catch { /* ignore */ }
  });

  // Only the author can edit or delete, and only inside the room they are currently in.
  socket.on('editMessage', async ({ id, text }) => {
    if (!text?.trim()) return;
    try {
      const msg = await Message.findOneAndUpdate(
        { _id: id, sender: username, room: socket.roomId },
        { text: text.trim().slice(0, 1000), edited: true },
        { new: true },
      );
      if (msg) io.to(socket.roomId).emit('messageEdited', msg);
    } catch { /* ignore */ }
  });

  socket.on('deleteMessage', async (id) => {
    try {
      const msg = await Message.findOneAndDelete({ _id: id, sender: username, room: socket.roomId });
      if (msg) io.to(socket.roomId).emit('messageDeleted', id);
    } catch { /* ignore */ }
  });

  socket.on('typing', (room) => socket.to(room).emit('typing', username));
  socket.on('stopTyping', (room) => socket.to(room).emit('stopTyping', username));
  socket.on('disconnect', leave);
}
