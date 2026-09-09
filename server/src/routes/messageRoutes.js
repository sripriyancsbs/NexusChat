import { Router } from 'express';
import { 
  getMessages, 
  sendMessage, 
  editMessage, 
  deleteMessage, 
  toggleReaction, 
  togglePin 
} from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.put('/:id', editMessage);
router.delete('/:id', deleteMessage);
router.post('/:id/reactions', toggleReaction);
router.post('/:id/pin', togglePin);

export default router;
