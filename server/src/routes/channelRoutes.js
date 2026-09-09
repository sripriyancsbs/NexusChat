import { Router } from 'express';
import { listChannels, createChannel, getChannelById, joinChannel } from '../controllers/channelController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', listChannels);
router.post('/', createChannel);
router.get('/:id', getChannelById);
router.post('/:id/join', joinChannel);

export default router;
