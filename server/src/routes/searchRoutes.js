import { Router } from 'express';
import { handleSearch } from '../controllers/searchController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', handleSearch);

export default router;
