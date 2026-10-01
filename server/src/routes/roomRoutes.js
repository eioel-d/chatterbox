import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listRooms, createRoom, joinPrivateRoom, startDM, getMessages, renameRoom, deleteRoom } from '../controllers/roomController.js';

const router = Router();
router.use(requireAuth);
router.get('/', listRooms);
router.post('/', createRoom);
router.post('/join', joinPrivateRoom);
router.post('/dm', startDM);
router.get('/:id/messages', getMessages);
router.patch('/:id', renameRoom);
router.delete('/:id', deleteRoom);
export default router;
