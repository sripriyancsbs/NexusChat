import { Router } from 'express';
import { login, logout, getSession } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/session', requireAuth, getSession);

export default router;
