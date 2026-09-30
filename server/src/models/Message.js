import { Schema, model } from 'mongoose';

export const Message = model('Message', new Schema({
  room: { type: Schema.Types.ObjectId, ref: 'Room', index: true },
  sender: String,
  text: { type: String, maxlength: 1000 },
}, { timestamps: { createdAt: true, updatedAt: false } }));
