import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listRooms, createRoom, getMessages } from '../controllers/roomController.js';

const router = Router();
router.use(requireAuth);
router.get('/', listRooms);
router.post('/', createRoom);
router.get('/:id/messages', getMessages);
export default router;
