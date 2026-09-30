import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, env.jwtSecret, { expiresIn: '7d' });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
