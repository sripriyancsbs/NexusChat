import { Router } from 'express';
import { listNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
