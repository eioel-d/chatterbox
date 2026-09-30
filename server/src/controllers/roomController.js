import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listRooms = asyncHandler(async (req, res) => res.json(await Room.find().sort('name')));

export const createRoom = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim().toLowerCase().replace(/\s+/g, '-');
  if (!name) return res.status(400).json({ error: 'Room name required' });
  if (await Room.findOne({ name })) return res.status(409).json({ error: 'That room already exists' });
  res.json(await Room.create({ name, createdBy: req.user.username }));
});

export const getMessages = asyncHandler(async (req, res) => {
  const msgs = await Message.find({ room: req.params.id }).sort('-createdAt').limit(100);
  res.json(msgs.reverse());
});
