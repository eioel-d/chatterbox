import bcrypt from 'bcryptjs';
import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { accessFilter, publicRoom } from '../utils/access.js';
import { getIO } from '../sockets/io.js';

const clean = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, '-');
const nameError = (name) => (!name ? 'Room name required'
  : name.length > 24 || name.includes(':') ? 'Name must be 24 characters or fewer, without ":"' : null);
const isOwner = (room, req) => room.createdBy === req.user.username && !room.isDM;

// Public rooms are announced to everyone; private rooms only to their members.
const announce = (room, event, payload) => {
  const io = getIO();
  if (!room.isPrivate) io?.emit(event, payload);
  else if (room.members.length) io?.to(room.members.map((m) => `u:${m}`)).emit(event, payload);
};

export const listRooms = asyncHandler(async (req, res) => {
  const rooms = await Room.find(accessFilter(req.user.username)).sort('name');
  res.json(rooms.map(publicRoom));
});

export const createRoom = asyncHandler(async (req, res) => {
  const name = clean(req.body.name);
  const password = req.body.password || '';
  const bad = nameError(name);
  if (bad) return res.status(400).json({ error: bad });
  if (password && password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' });
  if (await Room.findOne({ name })) return res.status(409).json({ error: 'That room already exists' });
  const room = await Room.create({
    name, createdBy: req.user.username, isPrivate: !!password,
    passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
    members: password ? [req.user.username] : [],
  });
  const out = publicRoom(room);
  if (!room.isPrivate) getIO()?.emit('roomCreated', out); // public rooms appear live for everyone
  res.json(out);
});

export const joinPrivateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ name: clean(req.body.name), isPrivate: true }).select('+passwordHash');
  if (!room || !(await bcrypt.compare(req.body.password || '', room.passwordHash))) {
    return res.status(401).json({ error: 'Wrong room name or password' });
  }
  await Room.updateOne({ _id: room._id }, { $addToSet: { members: req.user.username } });
  res.json(publicRoom(room));
});

export const startDM = asyncHandler(async (req, res) => {
  const me = req.user.username;
  const other = (req.body.username || '').trim();
  if (!other || other === me) return res.status(400).json({ error: 'Pick another user' });
  if (!(await User.findOne({ username: other }))) return res.status(404).json({ error: 'User not found' });
  const members = [me, other].sort();
  const name = `dm:${members.join('+')}`;
  const room = (await Room.findOne({ name })) || (await Room.create({ name, createdBy: me, isDM: true, members }));
  res.json(publicRoom(room));
});

export const getMessages = asyncHandler(async (req, res) => {
  const room = await Room.findOne({ _id: req.params.id, ...accessFilter(req.user.username) });
  if (!room) return res.status(403).json({ error: 'You do not have access to this room' });
  const msgs = await Message.find({ room: room._id }).sort('-createdAt').limit(100);
  res.json(msgs.reverse());
});

export const renameRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!isOwner(room, req)) return res.status(403).json({ error: 'Only the room creator can do that' });
  const name = clean(req.body.name);
  const bad = nameError(name);
  if (bad) return res.status(400).json({ error: bad });
  if (name !== room.name && (await Room.findOne({ name }))) return res.status(409).json({ error: 'That room already exists' });
  room.name = name;
  await room.save();
  const out = publicRoom(room);
  announce(room, 'roomUpdated', out);
  res.json(out);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (!isOwner(room, req)) return res.status(403).json({ error: 'Only the room creator can do that' });
  await Message.deleteMany({ room: room._id });
  await room.deleteOne();
  announce(room, 'roomDeleted', { id: String(room._id) });
  res.json({ ok: true });
});
