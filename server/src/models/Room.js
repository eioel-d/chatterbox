import { Schema, model } from 'mongoose';

export const Room = model('Room', new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  createdBy: String,
  isPrivate: { type: Boolean, default: false },
  isDM: { type: Boolean, default: false },
  passwordHash: { type: String, select: false },
  members: [String],
}));
