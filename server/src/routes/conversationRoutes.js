import { Router } from 'express';
import { listConversations, getOrCreateDirect, markAsRead } from '../controllers/conversationController.js';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listConversations);
router.post('/direct', getOrCreateDirect);
router.patch('/:id/read', markAsRead);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);

export default router;
