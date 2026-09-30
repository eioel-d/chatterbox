import { verifyToken } from '../utils/token.js';

export function requireAuth(req, res, next) {
  try {
    req.user = verifyToken((req.headers.authorization || '').replace('Bearer ', ''));
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again' });
  }
}
