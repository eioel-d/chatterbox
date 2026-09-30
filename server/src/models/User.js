import { Schema, model } from 'mongoose';

export const User = model('User', new Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  passwordHash: { type: String, required: true },
}));
