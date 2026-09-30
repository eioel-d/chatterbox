import { Schema, model } from 'mongoose';

export const Room = model('Room', new Schema({
  name: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 24 },
  createdBy: String,
}));
