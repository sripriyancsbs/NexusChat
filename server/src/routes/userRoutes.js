import { Router } from 'express';
import { getMe, updateMe, listUsers, getUserById } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/', listUsers);
router.get('/:id', getUserById);

export default router;
