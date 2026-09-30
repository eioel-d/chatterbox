import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username (3+ chars) and password (6+ chars) required' });
  }
  if (await User.findOne({ username })) return res.status(409).json({ error: 'That username is taken' });
  const user = await User.create({ username, passwordHash: await bcrypt.hash(password, 10) });
  res.json({ token: signToken(user), username: user.username });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Wrong username or password' });
  }
  res.json({ token: signToken(user), username: user.username });
});
